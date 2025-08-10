import graphene
from graphene_django import DjangoObjectType
from django_filters import FilterSet, filters
from graphene_django.filter import DjangoFilterConnectionField
from cv.models import Person, SocialLink, Skill, Experience, Education


class SocialLinkType(DjangoObjectType):
    class Meta:
        model = SocialLink
        fields = ("id", "platform", "url")


class SkillType(DjangoObjectType):
    class Meta:
        model = Skill
        fields = ("id", "name", "level")


class ExperienceType(DjangoObjectType):
    class Meta:
        model = Experience
        fields = ("id", "company", "role", "start_date", "end_date", "description")


class EducationType(DjangoObjectType):
    class Meta:
        model = Education
        fields = ("id", "school", "degree", "field", "start_year", "end_year")


class PersonType(DjangoObjectType):
    social_links = graphene.List(SocialLinkType)
    skills = graphene.List(SkillType)
    experiences = graphene.List(ExperienceType)
    education = graphene.List(EducationType)

    class Meta:
        model = Person
        fields = (
            "id",
            "full_name",
            "title",
            "email",
            "phone",
            "location",
            "summary",
            "photo_url",
            "social_links",
            "skills",
            "experiences",
            "education",
        )


# Input types for mutations
class PersonInput(graphene.InputObjectType):
    full_name = graphene.String()
    title = graphene.String()
    email = graphene.String()
    phone = graphene.String()
    location = graphene.String()
    summary = graphene.String()
    photo_url = graphene.String()


class SocialLinkInput(graphene.InputObjectType):
    platform = graphene.String()
    url = graphene.String()


class SkillInput(graphene.InputObjectType):
    name = graphene.String()
    level = graphene.Int()


class ExperienceInput(graphene.InputObjectType):
    company = graphene.String()
    role = graphene.String()
    start_date = graphene.Date()
    end_date = graphene.Date()
    description = graphene.String()


class EducationInput(graphene.InputObjectType):
    school = graphene.String()
    degree = graphene.String()
    field = graphene.String()
    start_year = graphene.Int()
    end_year = graphene.Int()


# Mutations
class UpdatePerson(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = PersonInput(required=True)

    person = graphene.Field(PersonType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, id, input):
        try:
            person = Person.objects.get(pk=id)
            for field, value in input.items():
                if value is not None:
                    setattr(person, field, value)
            person.save()
            return UpdatePerson(person=person, success=True, errors=[])
        except Person.DoesNotExist:
            return UpdatePerson(person=None, success=False, errors=["Person not found"])
        except Exception as e:
            return UpdatePerson(person=None, success=False, errors=[str(e)])


class AddSkill(graphene.Mutation):
    class Arguments:
        person_id = graphene.ID(required=True)
        input = SkillInput(required=True)

    skill = graphene.Field(SkillType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, person_id, input):
        try:
            person = Person.objects.get(pk=person_id)
            skill = Skill.objects.create(
                person=person,
                name=input.name,
                level=input.level or 3
            )
            return AddSkill(skill=skill, success=True, errors=[])
        except Person.DoesNotExist:
            return AddSkill(skill=None, success=False, errors=["Person not found"])
        except Exception as e:
            return AddSkill(skill=None, success=False, errors=[str(e)])


class AddExperience(graphene.Mutation):
    class Arguments:
        person_id = graphene.ID(required=True)
        input = ExperienceInput(required=True)

    experience = graphene.Field(ExperienceType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, person_id, input):
        try:
            person = Person.objects.get(pk=person_id)
            experience = Experience.objects.create(
                person=person,
                company=input.company,
                role=input.role,
                start_date=input.start_date,
                end_date=input.end_date,
                description=input.description or ""
            )
            return AddExperience(experience=experience, success=True, errors=[])
        except Person.DoesNotExist:
            return AddExperience(experience=None, success=False, errors=["Person not found"])
        except Exception as e:
            return AddExperience(experience=None, success=False, errors=[str(e)])


class AddEducation(graphene.Mutation):
    class Arguments:
        person_id = graphene.ID(required=True)
        input = EducationInput(required=True)

    education = graphene.Field(EducationType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, person_id, input):
        try:
            person = Person.objects.get(pk=person_id)
            education = Education.objects.create(
                person=person,
                school=input.school,
                degree=input.degree,
                field=input.field or "",
                start_year=input.start_year,
                end_year=input.end_year
            )
            return AddEducation(education=education, success=True, errors=[])
        except Person.DoesNotExist:
            return AddEducation(education=None, success=False, errors=["Person not found"])
        except Exception as e:
            return AddEducation(education=None, success=False, errors=[str(e)])


class Mutation(graphene.ObjectType):
    update_person = UpdatePerson.Field()
    add_skill = AddSkill.Field()
    add_experience = AddExperience.Field()
    add_education = AddEducation.Field()


class Query(graphene.ObjectType):
    person = graphene.Field(PersonType, id=graphene.ID(required=True))
    people = graphene.List(PersonType)

    def resolve_person(root, info, id):
        return Person.objects.prefetch_related(
            "social_links", "skills", "experiences", "education"
        ).get(pk=id)

    def resolve_people(root, info):
        return Person.objects.all().prefetch_related(
            "social_links", "skills", "experiences", "education"
        ).first()


schema = graphene.Schema(query=Query, mutation=Mutation)
