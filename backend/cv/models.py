from django.db import models


class Person(models.Model):
    full_name = models.CharField(max_length=200)
    title = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=200, blank=True)
    summary = models.TextField(blank=True)
    photo_url = models.URLField(blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return self.full_name


class SocialLink(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="social_links")
    platform = models.CharField(max_length=100)
    url = models.URLField()

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.platform}: {self.url}"


class Skill(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=100)
    level = models.PositiveSmallIntegerField(default=3)  # 1-5

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.name} ({self.level})"


class Experience(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="experiences")
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.role} @ {self.company}"


class Education(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="education")
    school = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    field = models.CharField(max_length=200, blank=True)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-start_year"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.degree} - {self.school}"

# Create your models here.
