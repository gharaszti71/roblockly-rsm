# Roblockly Resource Scaling Manager

A service létrehozza és kezeli a **Roblockly** kliensek számára a háttérszolgáltatást, az úgynevezett **Capsule**-t. Az RRSM egy nodejs-ben megírt RESTful protokolon vezérelhető proxy, mely automatikusan elindítja és le is zárja a capsule Docker image-eket, valamint gatewayt képet feléjük. A következő komponensek alkotjál:

* **User service**, ami a felhasználókat kezeli. Kétféle felhasználó típus létezik:
    * **Admin**: a felhasználó interaktív session-t indíthat és menedzselheti, monitorozhatja a rendszert
    * **Service**: a felhasználó kizárólag session-t indíthat, és kezelhet

A kétféle felhasználó típus kölcsönösen kizárja egymást!
A rendszer rendelkezik a config mappában egy **user.json** fájllal, melyben a felhasználók adatai találhatóak, valamint egy **config.json** fájllal, melyben a konfigurációs paraméterek találhatók. /és ide a folyamatnak írási joggal kell rendelkeznie/

A konfigurációs fájlra egy minta:
```json
{
    "dockerHosts": [
        {
            "host": "http://192.168.1.141",
            "ip": "192.168.1.141",
            "port": 2375
        }
    ],
    "pools": {
        "UR": {
            "start": 40000,
            "limit": 100
        },
        "ROS": {
            "start": 50000,
            "limit": 100
        }
    },
    "imageName": "capsule",
    "logLevel": "debug",
    "watchdogSeconds": 5,
    "maxInactivitySeconds": 120
}
```
A **dockerHosts** paraméterben található a távolról is elérhetővé tett docker szolgáltatás, akár több is felsorolva /jelenleg a rendszer csak az elsőt használja/. A **host** paraméterben található az elérés URL-je a megfelelő protokollal megjelölve, az **ip** paraméterben található a docker host IP címe, amire majd a proxy a port forwardingot fogja létrehozni, míg a **port** paraméterben találhaó a távoli menedzsemnt portja a dockernek.

Az **imageName** paraméter tartalmazza a hostokon azt az egységes image nevét, melyből létre kell hozni és el kell indítani a capsule-t.

A **pools** paraméterek tartalmazzák az **UR** és **ROS** tcp port pool-okat, ahonnan (**start**) és amennyit (**limit**) a rendszer kioszt a létrehozott capsule konténerekhez.

## RESTful interfész

A rendszer az egyes feladatainak elvégzésére RESTful ionterfészt biztosít. Alapvetően kétféle szervíz létezik egyelőre. A User szervíz és a Session szervíz. Tervbe van még véve egy Management szervíz létrehozása is a rendszer pillanatnyi állapotának monitorozásáta. Alapveztően közös a szervízekben, hogy token alapú authentikációval be kell jelentkezni, mielőtt bármit is tudnánk tenni. A config mappában rendelkezésre bocsátottam egy Postman konfigurációs fájlt is, mely már fel van készítve valamennyi pillanatnyilag elérhető szolgáltatás meghívására, Roblockly-RSM.postman_collection.json fájlnéven érhető el. A [Postman program](https://www.getpostman.com/) letölthető innen: https://www.getpostman.com/

### USER Szervíz

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
POST | /users/login | Bejelentkezés Admin-ként. | OK - 200, Hiba - 400
> Request body
```json
{
	"name": "admin",
	"password": "password"
}
```

---

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
POST | /users | Felhasználó létrehozása. | OK - 201, Hiba - 400 és error
> Request body
```json
{
	"name":"teszt",
	"type":"Admin",
	"password":"password"
}
```

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
GET | /users | Felhasználói lista lekérdezése | OK - 200, Hiba - 400 és error
> Response body
```json
[
    {
        "id": "07d20821-afc1-46af-9cf1-39dde7ca9d9e",
        "name": "admin",
        "type": "Admin"
    },
    {
        "id": "17aa6c52-4d0c-4051-af37-6eaff03fd6f8",
        "name": "service",
        "type": "Service"
    }
]
```

---

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
DELETE | /users/id | Felhasználó (id-jű) törlése | OK - 200, Hiba - 400 és error


HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
PATCH | /users/id | Felhasználó (id-jű) módosítása | OK - 200, Hiba - 400 és error
> Request body (csak a módosítani kívánt paraméter kell megadni!)
```json
{
	"name":"teszt",
	"type":"Admin",
	"password":"password"
}
```

---

### SERVICE szervíz

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
POST | /service/login | Bejelentkezés Service-ként. | OK - 200, Hiba - 400
> Request body
```json
{
	"name": "service",
	"password": "password"
}
```
> Response body
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3YWE2YzUyLTRkMGMtNDA1MS1hZjM3LTZlYWZmMDNmZDZmOCIsImlhdCI6MTU1ODI3OTY4M30.o3_8_F1WLEVprRwRJ_eDxLLjjR2vScdQhLSKRHtV8Bc"
}
```

---

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
POST | /service/start | Új session indítása | OK - 200, Hiba - 400
> Response body
```json
{
    "sid": "1543fb1e-233f-41eb-a676-416c678e18e6",
    "rosPort": 50000,
    "urPort": 40000
}
```
Az új Roblockly session indítása magával hozza, hogy a Docker host-on is létrejön és elindul egy konténer, valamint a fent említett kétféle pool-ból kiosztódik 1-1 egyedi port is, amire a Capsule megfelelő portjai az **RRSM** IP címén rá lesznek mappelve. A két portból számunkra az **rosPort** az érdekes, a virtuális robot ROS kliensét ide kell írányítani. **FIGYELEM**, amint megszűnik a ws kapcsolat, akkor rögtön törlődik is a session, valamint amíg megvan a ws kapcsolat, addig él a session!!! A Roblockly scriptet más úton kell eljuttatni a capsule-nak!

---

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
POST | /service/sid | Roblockly program küldése (sid session-nek) | OK - 200, Hiba - 400
> Request body
```json
{
    "program": "progi"
}
```

---

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
DELETE | /service/sid | Session (sid-el azonosított) lezárása | OK - 200, Hiba - 400 és error

Ez a lezárási mód az úgynevezett *graceful* lezárás. Ilyenkor - és a session indítánál leírtak esetében is - lezáródik a ROS proxy, valamint törlődik a Docker container.

---

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
GET | /containers | Container lista lekérdezése | OK - 200, Hiba - 400 és error
> Response body
```json
[
    {
        "id": "ef6c12b635010d14b8fa7641c1a97c3c2f1cfae787d7430638ddfd0f98e38a4a",
        "name": "bdfb01dd-01db-4a84-8778-f39b234ac45b",
        "state": "running",
        "status": "Up 5 seconds",
        "orphan": false
    }
]
```
A listaelemek az id-n kívül a session nevét - ami egyben a konténer neve is - tartalmazzák, valamint állapotát és státuszát. Az *orphan* adattag igaz, ha elárvult session-ről van szó, azaz nincs neki megfelelője a session listában.

---

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
GET | /service/:sid | session portjainak lekérdezése | OK - 200, Hiba - 400 error - 404 nem található
> Response body
```json
{
    "sid": "3dbb278c-e1b0-44c0-bad0-55e7c50c4810",
    "rosPort": 50000,
    "urPort": 40000
}
```
Visszaadja az adott session hozzárendelt portjait.

---

HTTP verb | URI | Funkció | HTTP response code
----------|-----|---------|-------------------
POST | /watchdog/:sid | Wathchdog | OK - 200, Hiba - 400, 404

Időszakosan hívni kell a session-ökből a watchdogot, mert különben egy timeout idő elteltével a rendszer kidobja az adott session-t.

[MarkDown doksi](https://guides.github.com/features/mastering-markdown/)