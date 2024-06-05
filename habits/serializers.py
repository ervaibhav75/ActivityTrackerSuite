from rest_framework import serializers
from .models import HabitLog, Habit

class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'habit', 'status', 'date', 'user']
        read_only_fields = ['user', 'id']  # Make the 'user' field read-only

    def create(self, validated_data):
        # Set the user field to the current user when creating a new HabitLog instance
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, attrs):
        # Additional validation for 'habit', 'status', 'date', etc. if needed
        return attrs


class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ['id', 'name', 'description', 'reward','repeat_after', 'user']
        read_only_fields = ['id',]  # Make the 'user' field read-only

    def validate_name(self, value):
        if value == self.initial_data.get('description'):
            raise serializers.ValidationError("Name and description cannot be the same.")
        if len(value.split()) > 50:
            raise serializers.ValidationError("Name cannot exceed 50 words.")
        if not value:
            raise serializers.ValidationError("Name cannot be null or an empty string.")
        return value

    def validate(self, attrs):
        # Additional validation for 'description', 'streak', etc. if needed
        return attrs
