from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import timedelta, date
from .models import Habit, HabitLog
from rest_framework import status
import json
from datetime import datetime
import logging

from .serializers import HabitSerializer

class UpdateHabitLogsView(APIView):
    def post(self, request):
        #states = json.loads(request.data.get('checkboxStates'))
        idsToDelete = request.data.get('idsToDelete')
        if len(idsToDelete) > 0:
            for eachID in idsToDelete:
                try:
                    habit_object = Habit.objects.get(id=int(eachID))
                    print(f'deleting {habit_object  }')
                    habit_object.delete()
                    print("deleted succesfully!")
                except Habit.DoesNotExist:
                # Handle the case where the object with the given ID doesn't exist
                    pass  # or you can log the error or take any other appropriate action
                    
        checkbox_states = request.data.get('checkboxStates')

        if checkbox_states:
            for key, value in checkbox_states.items():
                try:
                    habit_obj = Habit.objects.get(id=int(key))
                except Habit.DoesNotExist:
                    print(f'Habit with id {key} does not exist')
                    continue

                for eachDate in value:
                    try:
                        date_obj = datetime.strptime(eachDate, '%Y-%m-%d')
                    except ValueError as e:
                        print(f'Error parsing date {eachDate}: {e}')
                        continue

                    try:
                        habit_log_obj = HabitLog.objects.filter(
                            user=request.user, date=date_obj, habit=habit_obj
                        ).first()

                        if habit_log_obj:
                            habit_log_obj.status = True  # Assuming you want to set it to True
                            habit_log_obj.save()
                            print('existing object found!')
                        else:
                            habit_log_obj = HabitLog(
                                user=request.user, date=date_obj, habit=habit_obj, status=True
                            )
                            habit_log_obj.save()
                            print('I had to make a new object!')

                    except Exception as e:
                        print(f'Error updating habit log for {eachDate}: {e}')

                print(key, value)

            print(checkbox_states)
            return Response(status=200)
        else:
            return Response(status=400, data={'error': 'checkboxStates not provided'})

class FetchLast7DaysLogsView(APIView):  # Add parentheses after APIView
    def post(self, request):
        start_date_str = request.data.get('start_date')
        if not start_date_str:
            return Response({"error": "start_date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        start_date = date.fromisoformat(start_date_str)
        end_date = start_date - timedelta(days=6)
        final_logs = {}
        date_dict = {end_date + timedelta(days=i): False for i in range((start_date - end_date).days + 1)}
        habits_list = Habit.objects.filter(user=request.user)
        date_dict = {(end_date + timedelta(days=i)).strftime('%Y-%m-%d'): False for i in range((start_date - end_date).days + 1)}
        print(f" dict is {date_dict}")
        for item in habits_list:
            habit_logs = list(HabitLog.objects.filter(date__gte=end_date, date__lte=start_date, habit=item))
            #print(f"logs {habit_logs}")
            #time to process logs
            for each_log in habit_logs:
                if str(each_log.date) in date_dict:
                    print("date match!!")
                    date_dict[str(each_log.date)] = True
            
            
            final_logs[item.name] = {'sequence':date_dict.copy(), 'streak': item.streak, 'id':item.id}
            date_dict = {key: False for key in date_dict}

            
        print(final_logs)
        return Response(final_logs, status=200)

logger = logging.getLogger(__name__)

class HabitListAPIView(APIView):
    def get(self, request):
        try:
            user = request.user
            user_habits = Habit.objects.filter(user=user)
            serializer = HabitSerializer(user_habits, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("An error occurred while processing GET request in HabitListAPIView: %s", str(e))
            return Response({"error": "An internal server error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            request.data['user'] = request.user.id
            print(request.data)
            serializer = HabitSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  
        except Exception as e:
            logger.exception("An error occurred while processing POST request in HabitListAPIView: %s", str(e))
            return Response({"error": "An internal server error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HabitDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            habit = Habit.objects.get(pk=pk)
        except Habit.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = HabitSerializer(habit)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        try:
            habit = Habit.objects.get(pk=pk)
        except Habit.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = HabitSerializer(habit, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            habit = Habit.objects.get(pk=pk)
        except Habit.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        habit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
