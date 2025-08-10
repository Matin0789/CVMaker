from django.core.management.base import BaseCommand
from django.utils import timezone
from cv.models import Person, SocialLink, Skill, Experience, Education


class Command(BaseCommand):
    help = "Seed the database with a sample CV"

    def handle(self, *args, **options):
        Person.objects.all().delete()
        person = Person.objects.create(
            full_name="Ada Lovelace",
            title="Software Engineer",
            email="ada@example.com",
            phone="+1 555 555 5555",
            location="London, UK",
            summary=(
                "Engineer with a passion for algorithms, data visualization, "
                "and building reliable systems."
            ),
            photo_url="/static/images/avatar.svg",
        )

        SocialLink.objects.bulk_create([
            SocialLink(person=person, platform="GitHub", url="https://github.com/ada"),
            SocialLink(person=person, platform="LinkedIn", url="https://linkedin.com/in/ada"),
        ])

        Skill.objects.bulk_create([
            Skill(person=person, name="Python", level=5),
            Skill(person=person, name="Django", level=5),
            Skill(person=person, name="GraphQL", level=4),
            Skill(person=person, name="PostgreSQL", level=4),
        ])

        Experience.objects.bulk_create([
            Experience(
                person=person,
                company="Analytical Engines",
                role="Senior Engineer",
                start_date=timezone.datetime(2022, 1, 1).date(),
                end_date=None,
                description="Leading development of data platforms and APIs.",
            ),
            Experience(
                person=person,
                company="Math & Co",
                role="Engineer",
                start_date=timezone.datetime(2019, 6, 1).date(),
                end_date=timezone.datetime(2021, 12, 31).date(),
                description="Built visualization tooling and scalable services.",
            ),
        ])

        Education.objects.bulk_create([
            Education(
                person=person,
                school="Imperial College London",
                degree="MSc Computer Science",
                field="Software Engineering",
                start_year=2017,
                end_year=2018,
            ),
            Education(
                person=person,
                school="University of London",
                degree="BSc Mathematics",
                field="Applied Mathematics",
                start_year=2013,
                end_year=2016,
            ),
        ])

        self.stdout.write(self.style.SUCCESS("Seeded sample CV data."))
