from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import StudentForm, StudentCrud
from .models import Student

def registration(request):
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Your registration is successfull")
            return redirect("dashboard")
        else:
            messages.error(request, "Correct the error shown")
    else:
        form = StudentForm()
    return render(request, 'management/registration.html', {'form':form})

def userlogin(request):
    if request.method == 'POST':
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, "Login Successfull")
            return redirect("dashboard")
        else:
            messages.error(request, "Invalid Username or Password")
    return render(request, 'management/login.html')

def userlogout(request):
    logout(request)
    messages.success(request, "Logout Successfull")
    return redirect("login")

@login_required
def dashboard(request):
    return render(request, 'management/dashboard.html')


def create(request):
    form = StudentCrud()
    if request.method == 'POST':
        form = StudentCrud(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "New student added successfully")
            return redirect('dashboard')
    return render(request, 'management/create.html', {'form' : form})

def studentlist(request):
    students = Student.objects.all()
    return render(request, 'management/list.html', {'students' : students})

def update(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        form = StudentCrud(request.POST, instance=student)
        if form.is_valid():
            form.save()
            messages.success(request, "Update successfull")
            return redirect('studentlist')
        else:
            messages.error(request, "Please correct the errors")
    else:
        form = StudentCrud(instance=student)
        return render(request, 'management/update.html', {'form' : form})

def delete(request, pk):
    form = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        form.delete()
        messages.success(request, "Deletion Successfull")
        return redirect('studentlist')
    return render(request, 'management/delete.html', {'form' : form})



        
