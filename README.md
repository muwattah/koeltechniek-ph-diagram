# Interactief Log p-h Diagram – Koeltechniek

Eenvoudige maar bruikbare webtool voor het tekenen van een koelcyclus op een log p-h diagram en het berekenen van de COP.

## Ondersteunde koudemiddelen
- **R-513A** (Opteon XP10) – vrij nauwkeurig
- **R-134a** – vrij nauwkeurig
- R-410A en R-32 – grove benadering

## Hoe te gebruiken
1. Kies koudemiddel
2. Vul verdampings- en condensatietemperatuur in
3. Stel oververhitting en onderkoeling in
4. Klik op **Teken cyclus + Bereken COP**

Je ziet meteen:
- De dampkoepel
- De 4 punten van de cyclus
- Alle enthalpieën
- Specifiek koelvermogen, arbeid en **COP**

## GitHub Pages activeren
1. Ga naar de repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / folder: `/ (root)`
4. Save

Na 1–2 minuten is de site live op:
`https://muwattah.github.io/koeltechniek-ph-diagram/`

## Opmerking
Dit is een educatieve / praktische tool met geïnterpoleerde tabellen.  
Voor zeer precieze engineering-berekeningen gebruik je beter CoolProp, REFPROP of Danfoss CoolSelector.
