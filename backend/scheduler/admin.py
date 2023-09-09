from django.contrib import admin
from .models import SharedData, Course, Section
# Register your models here.

admin.site.register(SharedData)
admin.site.register(Course)
admin.site.register(Section)
