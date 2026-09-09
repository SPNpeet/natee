
CREATE TABLE content (id INTEGER PRIMARY KEY CHECK(id=1), version INTEGER NOT NULL, data TEXT NOT NULL, html_th TEXT NOT NULL, html_en TEXT NOT NULL, updated TEXT NOT NULL);
CREATE TABLE revisions (version INTEGER PRIMARY KEY, data TEXT NOT NULL, user_id INTEGER, updated TEXT NOT NULL);
CREATE TABLE media (path TEXT PRIMARY KEY, mime TEXT NOT NULL, bytes INTEGER NOT NULL, created TEXT NOT NULL);
CREATE TABLE inquiries (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, area TEXT NOT NULL, message TEXT NOT NULL, language TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created TEXT NOT NULL);
CREATE INDEX inquiries_created ON inquiries(created);
