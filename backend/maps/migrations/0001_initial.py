from django.db import migrations


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS uwaga_mapowa (
                id SERIAL PRIMARY KEY,
                id_usera INTEGER,
                id_ankiety INTEGER,
                geometria TEXT NOT NULL,
                tytul VARCHAR(255),
                opis TEXT,
                kategoria VARCHAR(100),
                data_dodania TIMESTAMP DEFAULT NOW(),
                status VARCHAR(20) DEFAULT 'oczekujaca'
            );
            """,
            reverse_sql="",
        ),
    ]
