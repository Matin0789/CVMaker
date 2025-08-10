from django.contrib import admin
from .models import Person, SocialLink, Skill, Experience, Education


class SocialLinkInline(admin.TabularInline):
    model = SocialLink
    extra = 1


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 1


class ExperienceInline(admin.StackedInline):
    model = Experience
    extra = 1


class EducationInline(admin.StackedInline):
    model = Education
    extra = 1


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ("full_name", "title", "email", "location")
    search_fields = ("full_name", "email", "location")
    inlines = [SocialLinkInline, SkillInline, ExperienceInline, EducationInline]


admin.site.register(SocialLink)
admin.site.register(Skill)
admin.site.register(Experience)
admin.site.register(Education)

# Register your models here.
