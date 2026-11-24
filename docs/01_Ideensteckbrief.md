# Teilaufgabe 1: Ideensteckbrief

**Modul:** Mobile Development – Transferarbeit I
**Technologie:** React Native, Expo, TypeScript
**Autor:** _[Name ergänzen]_
**Datum:** _[Datum ergänzen]_

---

## Arbeitstitel

**ReWear** – Gebrauchte Kleider und Schuhe einfach und professionell zum Verkauf vorbereiten

## Zielgruppe

- Privatpersonen (ca. 16–45 Jahre), die regelmässig Kleider und Schuhe aussortieren
- Personen, die gelegentlich auf Plattformen wie Ricardo, Tutti, Vinted oder in Instagram-/WhatsApp-Gruppen verkaufen
- **Nutzungssituation:** Zu Hause beim Ausmisten des Kleiderschranks; die Person fotografiert Artikel direkt mit dem Smartphone und erfasst sie unterwegs oder abends auf dem Sofa.

## Problem

- Viele gut erhaltene Kleider und Schuhe bleiben ungenutzt im Schrank, weil der Verkauf als aufwändig empfunden wird.
- Private Produktfotos wirken oft unprofessionell (unordentlicher Hintergrund, Bett, Boden, schlechtes Licht). Dadurch verkaufen sich Artikel schlechter oder zu tieferen Preisen.
- Wer mehrere Artikel gleichzeitig verkauft, verliert schnell den Überblick: Was ist bereits inseriert, was ist reserviert, was wurde verkauft und zu welchem Preis?

## Nutzen

- **Professionelle Produktfotos ohne Fotostudio:** Die App entfernt den Hintergrund eines Fotos automatisch und stellt den Artikel auf einen neutralen, hellen Hintergrund. Das ist das zentrale Unterscheidungsmerkmal gegenüber anderen Apps.
- **Alles an einem Ort:** Artikel mit allen verkaufsrelevanten Angaben (Grösse, Marke, Zustand, Preis) strukturiert erfassen.
- **Überblick über den Verkaufsstand:** Status pro Artikel (Entwurf, Zum Verkauf, Reserviert, Verkauft) und Übersicht über erzielte Einnahmen.
- **Schneller Weg zum Inserat:** Fertiges Inserat (Foto + Text) über die Teilen-Funktion des Smartphones an beliebige Verkaufsplattformen oder Messenger weitergeben.

## Kernfunktionen (priorisiert)

| Prio | Kernfunktion | Kurzbeschreibung |
|------|--------------|------------------|
| 1 | **Artikel verwalten** | Kleider und Schuhe mit Titel, Kategorie, Grösse, Marke, Zustand, Preis und Beschreibung erfassen, anzeigen, bearbeiten und löschen. |
| 2 | **Produktfoto mit Hintergrundentfernung** | Foto mit der Kamera aufnehmen oder aus der Galerie wählen, Hintergrund per API entfernen, Vorher/Nachher vergleichen und das gewünschte Bild dem Artikel zuordnen. |
| 3 | **Verkaufsstatus verfolgen und Inserat teilen** | Status eines Artikels ändern, Übersicht nach Status filtern und ein fertiges Inserat (Bild + Text) über das Teilen-Menü weitergeben. |

Zusammen ergibt sich der Kernablauf: **Artikel fotografieren → Hintergrund entfernen → Angaben erfassen → Inserat teilen → als verkauft markieren.**

## Ansichten (Screens)

1. **Übersicht (Mein Kleiderschrank):** Liste aller Artikel mit Vorschaubild, Titel, Preis und Status-Badge; Filter nach Status; Leerzustand mit Hinweis «Noch keine Artikel – erfasse deinen ersten Artikel».
2. **Artikel-Detail:** Grosses Bild, alle Angaben, Status ändern, Aktionen «Bearbeiten», «Teilen», «Löschen».
3. **Artikel erfassen / bearbeiten:** Formular mit Eingabevalidierung (Pflichtfelder, gültiger Preis).
4. **Foto-Editor:** Foto aufnehmen bzw. auswählen, Hintergrund entfernen, Vorher/Nachher-Ansicht, Bild übernehmen.
5. _(optional)_ **Einstellungen:** z. B. Hintergrundfarbe für freigestellte Bilder, API-Hinweise.

**Wiederverwendbare Komponenten (geplant):** `ArticleCard`, `StatusBadge`, `FormField`, `PrimaryButton`, `EmptyState`.

## Daten

Lokale, dauerhafte Speicherung (geplant: AsyncStorage für Daten, `expo-file-system` für Bilder).

| Feld | Typ | Pflicht | Beispiel |
|------|-----|---------|----------|
| `id` | string | ja | `"a1b2c3"` |
| `title` | string | ja | «Nike Air Max 90» |
| `category` | enum | ja | Oberteil, Hose, Kleid, Jacke, Schuhe, Accessoire |
| `size` | string | ja | «42» / «M» |
| `brand` | string | nein | «Nike» |
| `condition` | enum | ja | Neu, Wie neu, Gut, Getragen |
| `price` | number | ja | 45.00 (CHF, > 0) |
| `description` | string | nein | «Kaum getragen, Originalkarton vorhanden» |
| `originalPhotoUri` | string | nein | lokaler Dateipfad |
| `processedPhotoUri` | string | nein | lokaler Pfad zum freigestellten Bild |
| `status` | enum | ja | Entwurf, Zum Verkauf, Reserviert, Verkauft |
| `soldPrice` | number | nein | 40.00 |
| `createdAt` / `updatedAt` | ISO-Datum | ja | `"2026-11-19T10:00:00Z"` |

## API

- **Hauptkandidat: remove.bg API** – entfernt den Hintergrund eines hochgeladenen Bildes und liefert ein PNG mit transparentem Hintergrund zurück.
  - Zugang über API-Key (kostenloses Konto, begrenztes Gratiskontingent; Limits und Auflösung vor Projektstart prüfen).
  - Der API-Key wird **nicht** im Repository gespeichert (`.env`-Datei in `.gitignore`, Beispielwerte in `.env.example`).
- **Alternativen (zur Absicherung):** Photoroom API, Clipdrop API oder On-Device-Segmentierung (ML Kit / Apple Vision – benötigt allerdings einen Expo Development Build statt Expo Go).
- **Fallback:** Ist die API nicht erreichbar oder das Kontingent aufgebraucht, kann der Artikel mit dem Originalfoto gespeichert werden; die App zeigt eine verständliche Fehlermeldung.

## Gerätefunktion

- **Kamera** (`expo-image-picker` bzw. `expo-camera`) zum direkten Fotografieren des Artikels; zusätzlich Zugriff auf die **Fotogalerie**.
- **Fachlicher Nutzen:** Artikel werden dort fotografiert, wo sie aussortiert werden – ohne Umweg über andere Apps.
- **Berechtigungen:** Kamera- und Medienzugriff werden erst bei Bedarf angefragt. Bei Ablehnung oder Abbruch erscheint ein Hinweis mit Erklärung und Link zu den Systemeinstellungen; der Artikel kann trotzdem ohne Foto gespeichert werden.
- _(optional)_ **Teilen-Funktion** des Betriebssystems (`expo-sharing`) für das fertige Inserat.

## Abgrenzung (nicht Teil der ersten Version)

- Kein eigener Marktplatz zwischen Nutzerinnen und Nutzern (würde Backend, Login und Synchronisation erfordern)
- Kein Login / keine Benutzerkonten
- Keine Zahlungsfunktion, kein Versand- oder Paketmanagement
- Kein Chat bzw. keine Echtzeitkommunikation mit Käufern
- Keine automatische Veröffentlichung auf Ricardo, Tutti, Vinted usw. (nur Teilen über das Systemmenü)
- Keine automatische Preisempfehlung oder KI-Texterstellung
- Nur ein Hauptfoto pro Artikel in der ersten Version
- Keine Veröffentlichung im App Store / Play Store

## Risiken und offene Fragen

| Risiko / Frage | Mögliche Massnahme |
|----------------|--------------------|
| Gratiskontingent oder Auflösung der Hintergrund-API ist stark begrenzt | Limits früh prüfen, beim Entwickeln Testbilder sparsam einsetzen, Alternative-API bereithalten |
| API-Key ist in einer Client-App grundsätzlich auslesbar | Key nicht ins Repository, nur Gratiskonto verwenden, Einschränkung dokumentieren |
| Hintergrundentfernung liefert bei Kleidern auf ähnlichfarbigem Untergrund schlechte Resultate | Vorher/Nachher-Vergleich, Originalfoto bleibt immer verfügbar |
| Upload grosser Fotos ist langsam oder scheitert ohne Internet | Bild vor dem Upload verkleinern (`expo-image-manipulator`), Ladeanzeige, Fehlerbehandlung |
| Speicherung vieler Bilder belegt viel Speicherplatz | Bilder komprimieren, beim Löschen eines Artikels auch Bilddateien entfernen |
| Test auf iOS ist eventuell nicht möglich | Haupttestplattform festlegen, Einschränkung dokumentieren |
| Zeitbudget von 30 Stunden | Strikte Priorisierung der drei Kernfunktionen, optionale Features erst am Schluss |

**Offene Fragen an den Dozenten:**
- Ist die Abgrenzung (kein echter Marktplatz, sondern Verkaufsvorbereitung + Teilen) für das Thema in Ordnung?
- Ist die Verwendung einer API mit API-Key (remove.bg) zulässig, wenn der Key nicht im Repository liegt?

---

## Wireframes (Skizzen)

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ Mein Kleiderschrank   ⚙ │  │ ← Nike Air Max 90       │  │ ← Artikel erfassen      │  │ ← Foto bearbeiten       │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ [Alle][Verkauf][Verkauft]│  │ ┌─────────────────────┐ │  │ ┌──────┐                │  │  Vorher      Nachher    │
│                         │  │ │                     │ │  │ │ Foto │ [📷 Foto]       │  │ ┌────────┐ ┌────────┐   │
│ ┌────┐ Nike Air Max 90  │  │ │    (freigestellt)   │ │  │ └──────┘                │  │ │ ░░👟░░ │ │   👟   │   │
│ │ 👟 │ Gr. 42 · CHF 45  │  │ │                     │ │  │ Titel *                 │  │ │ ░░░░░░ │ │        │   │
│ └────┘ ● Zum Verkauf    │  │ └─────────────────────┘ │  │ [____________________]  │  │ └────────┘ └────────┘   │
│                         │  │ CHF 45.00               │  │ Kategorie *  [Schuhe ▼] │  │                         │
│ ┌────┐ Zara Jacke       │  │ Schuhe · Gr. 42 · Nike  │  │ Grösse *     [42     ]  │  │ [ Hintergrund entfernen]│
│ │ 🧥 │ Gr. M · CHF 20   │  │ Zustand: Wie neu        │  │ Zustand *    [Gut   ▼]  │  │                         │
│ └────┘ ✓ Verkauft       │  │                         │  │ Preis CHF *  [45.00  ]  │  │ [ Original verwenden ]  │
│                         │  │ Status: [Zum Verkauf ▼] │  │ Beschreibung            │  │ [ Freigestellt verwenden│
│                         │  │                         │  │ [____________________]  │  │                         │
│                    ( + )│  │ [Teilen][Bearb.][Lösch.]│  │ [      Speichern      ] │  │                         │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
       Übersicht                    Detail                   Erfassen/Bearbeiten               Foto-Editor
```

**Bedienablauf:** Übersicht → «+» → Erfassen → Foto-Editor → zurück zum Formular → Speichern → Detail → Teilen → Status «Verkauft».

---

## Notizen für die 2-minütige Vorstellung

1. **Einstieg (20 s):** «Wer hat Kleider im Schrank, die er nie mehr trägt? Verkaufen wäre sinnvoll – aber Fotos machen und Inserate schreiben ist mühsam.»
2. **Problem & Zielgruppe (30 s):** Private Verkäufer, unprofessionelle Fotos, fehlender Überblick über mehrere Verkäufe.
3. **Lösung & Alleinstellungsmerkmal (40 s):** ReWear – Artikel fotografieren, Hintergrund automatisch entfernen, Angaben erfassen, Inserat teilen, Verkaufsstatus verfolgen.
4. **Technik (20 s):** React Native mit Expo, Kamera als Gerätefunktion, remove.bg als externe API, lokale Speicherung.
5. **Abgrenzung & Risiken (10 s):** Kein eigener Marktplatz, kein Login; grösstes Risiko sind API-Limits.
