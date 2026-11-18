# StratiGraph — the words the four faces share

**This is documentation for whoever translates, not code.** No surface loads it
at runtime: each one carries its own dictionary, in its own shape (the field
assistant is one HTML file on purpose, the node's front door and the catalogue
are not). What lives here is the thing they have in common — and the language is
one of those things.

A person moving from the node's front door to the catalogue to a tablet in a
trench must meet **the same word for the same thing**, or they will think they
are in two products.

## The source language is English

Beside it, the languages of the project's case studies (T2.3) — because they are
the languages somebody will actually excavate in:

| locale | scenario |
|---|---|
| `en` | the source |
| `it` | S1 · Basilica Iulia |
| `ro` | S2 · Sarmizegetusa |
| `el` | S3 · Lampadistis |
| `es` | S4 · ILICI · S7 · Santa Olalla |
| `pl` | S5 · Kraków Spadzista |

`en` and `it` are complete. The other four exist with **the same keys and empty
values**, which fall back to English. Filling them is the partners' work, each
for their own language and their own dig: we build the slot and keep it honest.

## What is NOT translated, ever

Domain names are **terms, not text**, and a translated term is a term lost:

> **US** · **USV** · **DTC** · **HDT** · **ORCID** · **em.json** · `crmdig:D7` ·
> `E36` · the graph's node types and edge types · a room's id · a study's `em_id`

If you are unsure whether a word is a term, ask: would an archaeologist writing a
paper in your language leave it in the original? If yes, leave it.

## The shared words

| en | it | ro | el | es | pl |
|---|---|---|---|---|---|
| Node | Nodo | | | | |
| Room | Stanza | | | | |
| Study | Studio | | | | |
| Monument | Monumento | | | | |
| Sign in | Firma | | | | |
| Sign out | Esci | | | | |
| Signed in as | Firmato | | | | |
| Catalogue | Catalogo | | | | |
| Field assistant | Assistente di campo | | | | |
| Queue | Coda | | | | |
| Owner · Editor · Viewer | Proprietario · Editor · Lettore | | | | |
| Open in… | Apri in… | | | | |
| Explore · Read · Enter | Esplora · Leggi · Entra | | | | |
| Language | Lingua | | | | |

### Notes for translators

* **Sign in / Firma.** The Italian is the verb *to sign*, not *to log in*, and
  that is deliberate everywhere: what the person does is put their name to what
  they are about to record. Keep that sense if your language has it.
* **Room / Stanza.** A workspace where a graph is being edited *now*, not a
  chatroom. If your language has a word for a workroom, prefer it.
* **Study / Studio.** What has been published and can be cited — the opposite
  pole from a room. Not "research" in the abstract.
* **Explore · Read · Enter.** Three verbs that separate a monument, a study and a
  room on screen. They must stay three DIFFERENT verbs in every language: they
  are the only thing distinguishing three cards that otherwise look alike.

## One thing the field assistant does not translate

The assistant's **spoken commands** are in the language its NODE understands, and
today that is Italian — the intent vocabulary in `stratigraph-chatbot/app/intent.py`,
which the node publishes at `GET /v1/tools`. The page's chrome follows the
reader's locale; the conversation follows the node's. The page says so rather
than showing a Polish example of a command the node would refuse.

Teaching a node a second command language is a separate piece of work, and it
belongs to the node, not to the page.
