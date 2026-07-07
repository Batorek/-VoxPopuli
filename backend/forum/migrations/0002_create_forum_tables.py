from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("forum", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS watek (
                id BIGSERIAL PRIMARY KEY,
                id_usera INTEGER,
                id_ankiety INTEGER,
                tytul VARCHAR(255) NOT NULL,
                data_utworzenia TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                czy_zablokowany BOOLEAN NOT NULL DEFAULT FALSE
            );

            CREATE TABLE IF NOT EXISTS komentarz (
                id BIGSERIAL PRIMARY KEY,
                id_watku BIGINT NOT NULL REFERENCES watek(id) ON DELETE CASCADE,
                id_usera INTEGER,
                tresc TEXT NOT NULL,
                data_dodania TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                sentyment VARCHAR(20) NOT NULL DEFAULT 'neutralny',
                wynik_sentymentu DOUBLE PRECISION,
                czy_oflagowany BOOLEAN NOT NULL DEFAULT FALSE,
                czy_usuniety BOOLEAN NOT NULL DEFAULT FALSE
            );
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS komentarz;
            DROP TABLE IF EXISTS watek;
            """,
        ),
    ]
