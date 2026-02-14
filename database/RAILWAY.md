# MySQL na Railway – połączenie

Baza na Railway: nazwa **`railway`**, tabela **`users`**. Aby uruchomić SQL (np. z pliku `schema.sql` – BLOK 2, po wyborze bazy `railway`).

**Istniejąca baza:** jeśli tabela `users` powstała wcześniej, wykonaj migrację `database/migrate-add-role-reset.sql` (dodaje role, reset hasła).

## Dane z Railway (Variables)

| Zmienna   | Wartość (przykład)        |
|-----------|----------------------------|
| Host      | `crossover.proxy.rlwy.net` |
| Port      | `19911`                    |
| User      | `root`                     |
| Hasło     | MYSQLPASSWORD z Railway    |
| Baza      | `railway`                  |

## Jak uruchomić SQL

- **Terminal:** `mysql -h crossover.proxy.rlwy.net -P 19911 -u root -p railway < database\schema.sql` (w katalogu projektu; hasło z Railway).
- **DBeaver / inny klient:** nowe połączenie MySQL z powyższymi danymi, potem wykonaj zapytania z `database/schema.sql` (najpierw wybierz bazę `railway`, potem CREATE TABLE z BLOK 2).
