from rest_framework import serializers
from .models import Student, Course, Enrollment
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "name", "age", "email", "date_of_birth"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        value = value.strip().lower()
        qs = Student.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A student with this email already exists.")
        return value

    def validate(self, data):
        date_of_birth = data.get("date_of_birth", getattr(self.instance, "date_of_birth", None))
            
        if date_of_birth is None:
            raise serializers.ValidationError({"date_of_birth": "Date of birth is required."})
                
        return data


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name", "code"]
        read_only_fields = ["id"]

    def validate_code(self, value):
        return value.strip().upper()


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)

    course_name = serializers.CharField(source="course.name", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "student_name", "course", "course_name", "enrollment_date"] 
        read_only_fields = ["id", "enrollment_date"]

    def validate(self, data):
        student = data.get("student", getattr(self.instance, "student", None))

        course = data.get("course", getattr(self.instance, "course", None))
            
        if student and course:
            existing = Enrollment.objects.filter(student=student, course=course)

            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)

            if existing.exists():
                raise serializers.ValidationError("This student is already enrolled in this course.")

        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password2"]
        read_only_fields = ["id"]
        extra_kwargs = {"email": {"required": True}}

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        return User.objects.create_user(**validated_data) 

