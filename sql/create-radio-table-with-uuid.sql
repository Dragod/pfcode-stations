CREATE TABLE stations (
  id varchar(500),
  name varchar(500) UNIQUE NOT NULL,
  url varchar(500) NOT NULL,
  favorite boolean NOT NULL,
  CONSTRAINT stations_pkey PRIMARY KEY (id)
);

CREATE TRIGGER AutoGenerateUUID_stations
AFTER INSERT ON stations
FOR EACH ROW WHEN (NEW.id IS NULL)
BEGIN
  UPDATE stations SET id = (select lower(hex(randomblob(16)))) WHERE rowid = NEW.rowid;
END;