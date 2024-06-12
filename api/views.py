from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Mistake, MistakeFactor, Factor

from django.core.exceptions import ObjectDoesNotExist


import json
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .permissions import AuthorOnly
# Create your views here.
from rest_framework import generics
from .serializers import (UserSerializer,
                          ExistingMistakeFactorSerializer, NewMistakeFactorSerializer, MistakeSerializer, FactorSerializer)
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.mixins import ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.generics import ListAPIView
import logging

from datetime import datetime, timedelta

from rest_framework.decorators import api_view, permission_classes


import re
from django.db.models import Q


from api.data.filter_words import prepositions, conjunctions
import logging

logger = logging.getLogger(__name__)

from .models import ContactMessage
from .serializers import ContactMessageSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def UserContactView(request):
    data = request.data.copy()  # Make a mutable copy of request data
    
    if 'email' not in data or not data['email']:
        data['email'] = request.user.email  # Use the email from the authenticated user
    
    serializer = ContactMessageSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def filter_words(input_string):
    # Split input string into words
    words = input_string.split()

    # Filter out prepositions and conjunctions
    filtered_words = [word for word in words if word.lower(
    ) not in prepositions and word.lower() not in conjunctions]

    # Join filtered words back into a string
    filtered_string = " ".join(filtered_words)

    return filtered_string


def search_related_titles(input_string, model_name):

    if not input_string or input_string is None:
        return model_name.objects.none()

    # Tokenize input string into words

    words = input_string.split()

    # Construct regex pattern using words
    pattern = r'(' + '|'.join(words) + r')'

    # Compile regex pattern
    regex = re.compile(pattern, re.IGNORECASE)

    # Create Q objects for each word in the pattern
    q_objects = [Q(title__regex=word) for word in words]

    # Combine Q objects using OR operator
    combined_q = Q()
    for q_obj in q_objects:
        combined_q |= q_obj

    print("Combined words: {}".format(combined_q))
    # Query the model using the combined Q object
    results = model_name.objects.filter(combined_q)

    return results

class FetchFactorStatsView(APIView):
    permission_classes = (AuthorOnly,)

    def post(self, request):
        m_id = request.data.get('mId')
        if not m_id:
            return Response({'error': 'mID is required'}, status=400)

        response_dict = {}
        mistake_qs = MistakeFactor.objects.filter(mistake__id=m_id, user=request.user).prefetch_related('factor')
        
        for mistake_factor in mistake_qs:
            for factor in mistake_factor.factor.all():
                factor_data = FactorSerializer(factor).data
                factor_id = factor_data['id']
                if factor_id in response_dict:
                    response_dict[factor_id]['count'] += 1
                else:
                    factor_data['count'] = 1
                    response_dict[factor_id] = factor_data

        return Response(response_dict.values())

class FetchMistakeStatsView(APIView):
    permission_classes = (AuthorOnly,)

    def post(self, request):
        mistake_dict = {}
        days = request.data.get('days', 7)  # Default to 7 days if not provided
        now = datetime.now()
        last_seven_days = now - timedelta(days=int(days))
        
        # Get the current user (assuming the user is authenticated)
        current_user = request.user
        
        # Filter MistakeFactor objects by date range and user
        mfact_data = MistakeFactor.objects.filter(
            date__gte=last_seven_days, 
            date__lte=now,
            mistake__user=current_user  # Assuming Mistake has an author field
        )
        
        mistake_objects = {}
        
        for item in mfact_data:
            mistake_id = item.mistake.id
            if mistake_id in mistake_dict:
                mistake_dict[mistake_id] += 1
            else:
                mistake_dict[mistake_id] = 1
        
        for identity in mistake_dict.keys():
            mistake = Mistake.objects.get(id=identity)
            serializer = MistakeSerializer(mistake)
            mistake_objects[identity] = serializer.data
            
        res = {"result": {'data': mistake_dict, 'info': mistake_objects}}
        return Response(res)
        


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        try:
            # Call the super method to handle the request
            return super().post(request, *args, **kwargs)
        except Exception as e:
            # Log the exception
            logger.exception("An error occurred in CreateUserView: %s", e)
            # Print the error to the console (optional)
            print("An error occurred in CreateUserView:", e)
            # Return an appropriate response
            # You can customize the response based on the exception
            return Response({"error": "An error occurred while processing your request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetailsFetch(APIView):
    def post(self, request):
        user_details = {
            'id': request.user.id,
            'username': request.user.username,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.email,
            # Include other relevant user fields as needed
        }
        print(f'user is : {user_details}')
        return Response(user_details,status = 200)
    

class ListUserView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)


class RelatedFactorSearchView(APIView):
    permission_classes = (AuthorOnly,)
    def post(self, request):
        try:
            title = request.data['title']
            related_misfact = MistakeFactor.objects.filter(mistake__title=title)
            factors = set()
            for item in related_misfact:
                factors.update(item.factor.all())  # Update set with individual Factor objects
            new_factor_list = list(factors)
            serializer = FactorSerializer(new_factor_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except KeyError:
            logger.exception("Title not found in request data")
            return Response({'error': 'Title not found in request data'}, status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            logger.exception("Related MistakeFactor not found")
            return Response({'error': 'Related MistakeFactor not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("An unexpected error occurred")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class CreateCustomMistakeFactorView(APIView):
    permission_classes = (AuthorOnly,)
    def post(self, request):
        try:
            mistake_data = json.loads(request.data.get('mistake', []))
 
            factor_data = json.loads(request.data.get('factor', []))

                        
            custom_mistake_obj = None
            factors = []
         
            for item in mistake_data:
                is_custom = item.get('is_custom', False)
                if is_custom:
                    item['user'] = request.user.id
                    serializer = MistakeSerializer(data=item, context={'request': request})
                    if serializer.is_valid():
                        custom_mistake_obj = serializer.save()
                    else:
                        print("Could not serialize in first foor loop")
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    try:
                        custom_mistake_obj = Mistake.objects.get(id=item['mistake_id'])
                    except ObjectDoesNotExist:
                        logger.exception("Mistake object does not exist error")
                        return Response({'error': 'Mistake not found'}, status=status.HTTP_404_NOT_FOUND)

            for item in factor_data:
                if item['is_custom'] is True:
                    item['user'] = request.user.id
                    serializer = FactorSerializer(data=item, context={'request': request})
                    if serializer.is_valid():
                        factor_object = serializer.save()
                        factors.append(factor_object)
                    else:
                        print("Could not serialize in second for loop")
                        logger.exception("A serializer error due to factor serializer ")
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    try:
                        factor_object = Factor.objects.get(id=item['factor_id'])
                        factors.append(factor_object)
                    except ObjectDoesNotExist:
                        logger.exception("An error occurred in that object does not exists")
                        return Response({'error': 'Factor not found'}, status=status.HTTP_404_NOT_FOUND)

            serializer = NewMistakeFactorSerializer(data={'user': request.user.id, 'mistake': custom_mistake_obj.id, 'factor': [factor.id for factor in factors]}, context={'request': request})
            if serializer.is_valid():
                mistake_factor_object = serializer.save()
                return Response({'message': 'MistakeFactor created successfully'}, status=status.HTTP_201_CREATED)
            else:
                print("could not serialise in end")
                logger.exception("Invalid Serializer response from MF serializer itelf")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("An error occurred in CreateCustomMistakeFactorView which is very generic")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListMistakesView(ListAPIView):
    queryset = Mistake.objects.all()
    serializer_class = MistakeSerializer
    permission_classes = (AuthorOnly,)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            if queryset.exists():
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data)
            else:
                return Response({"message": "No data found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("An unexpected error occurred")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListFactorView(ListAPIView):
    queryset = Factor.objects.all()
    serializer_class = FactorSerializer
    permission_classes = (AuthorOnly,)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            if queryset.exists():
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data)
            else:
                return Response({"message": "No data found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("An unexpected error occurred")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class FactorSearchByRegexView(APIView):
    permission_classes = (AuthorOnly,)
    def post(self, request):
        try:
            data = request.data.get('query')
            if not data:
                return Response({'error': 'Query parameter is missing'}, status=status.HTTP_400_BAD_REQUEST)
            
            query = filter_words(data)
            logger.info(f"Filtered words are: {query or 'none'}")

            results = search_related_titles(query, Factor)
            logger.info(f"Queryset is: {results or 'none'}")

            serializer = FactorSerializer(results, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.exception("An unexpected error occurred")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MistakeSearchByRegexView(APIView):
    permission_classes = [AuthorOnly]
    
    def post(self, request):
        try:
            data = request.data.get('query')
            if not data:
                return Response({'error': 'Query parameter is missing'}, status=status.HTTP_400_BAD_REQUEST)
            
            query = filter_words(data)
            logger.info(f"Filtered words are: {query or 'none'}")
            
            results = search_related_titles(query, Mistake)
            logger.info(f"Queryset is: {results or 'none'}")

            serializer = MistakeSerializer(results, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.exception("An unexpected error occurred")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)