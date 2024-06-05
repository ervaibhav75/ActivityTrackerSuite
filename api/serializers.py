from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MistakeFactor, Mistake, Factor
# contact/serializers.py
from .models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['title', 'description', 'contact_number', 'email']
        extra_kwargs = {
            'contact_number': {'required': False}  # Make the field optional
        }

class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    
    def validate(self, attrs):
    # Check if email field is provided
        if 'email' not in attrs:
            raise serializers.ValidationError({'error': 'Email is required'})
        
        return attrs  
    def create(self, validated_data):
        password1 = validated_data['password']
        password2 = validated_data['password2']
        email = validated_data['email']

        if password1 != password2:
            raise serializers.ValidationError({'error': 'Passwords do not match'})

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'error': 'Email already exists'})

        user = User.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=password1
        )

        return user

class MistakeSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Mistake
        fields = ['id', 'user', 'title', 'description', 'counter']

    def validate(self, data):
        data['title'] = data['title'].strip().lower()
        data['description'] = data['description'].strip().lower()
        if data['title'] is None or data['description'] is None:
            raise serializers.ValidationError({'error': 'Mistake title and description cannot be empty'})
            
        if data['title'] == data['description']:
            raise serializers.ValidationError({'error': 'Mistake title and description cannot be the same'})
        
        if len(data['title']) < 3 or len(data['description']) < 3:
            raise serializers.ValidationError({'error': 'Mistake title and description must be at least 3 characters long'})
        
        return data
     
    def create(self, validated_data):
        # Create and return the Mistake object
        return Mistake.objects.create(**validated_data)

class FactorSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = Factor
        fields = ['id', 'user', 'title', 'solution', 'counter']
        
    def validate(self, data):
        data['title'] = data['title'].strip().lower()
        data['solution'] = data['solution'].strip().lower()
        
        if data['title'] is None or data['solution'] is None:
            raise serializers.ValidationError({'error': 'Factor title and solution cannot be empty'})

        if data['title'] == data['solution']:
            raise serializers.ValidationError({'error': 'Factor title and solution cannot be the same'})
        
        if len(data['title']) < 3 or len(data['solution']) < 3:
            raise serializers.ValidationError({'error': 'Factor title and solution must be at least 3 characters long'})
        
        return data
    def create(self, validated_data):
       
        # Create and return the Mistake object
        return Factor.objects.create(**validated_data)

class NewMistakeFactorSerializer(serializers.Serializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    mistake = serializers.PrimaryKeyRelatedField(queryset=Mistake.objects.all())
    factor = serializers.PrimaryKeyRelatedField(many=True, queryset=Factor.objects.all())

    class Meta:
        model = MistakeFactor
        fields = ['id', 'user', 'mistake', 'factor']

    def create(self, validated_data):
        user = validated_data.pop('user')
        mistake = validated_data.pop('mistake')
        factors = validated_data.pop('factor')
        
        mistake_factor = MistakeFactor.objects.create(user=user, mistake=mistake, **validated_data)
        mistake_factor.factor.set(factors)
        return mistake_factor


class ExistingMistakeFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MistakeFactor
        fields = ['id', 'user', 'mistake', 'factor', 'date']

    def create(self, validated_data):
        mistake_id = validated_data.pop('mistake')
        factor_id = validated_data.pop('factor')

        if Mistake.objects.filter(id=mistake_id).exists() and Factor.objects.filter(id=factor_id).exists():
            mistake_factor = MistakeFactor.objects.create(mistake_id=mistake_id, factor_id=factor_id, **validated_data)
            return mistake_factor
        else:
            raise serializers.ValidationError({'error': 'Mistake or Factor does not exist'})
