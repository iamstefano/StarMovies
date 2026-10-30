# StarMovies

Catalogo di film e serie TV basato su The Movie Database (TMDB), realizzato in HTML, CSS e JavaScript vanilla.

## Funzioni

- Film popolari, titoli in programmazione, serie TV, ricerca e pagine di dettaglio aggiornati tramite l'API TMDB.
- Raccolta personale di film e serie TV preferiti, stato «visto/a», voto da 1 a 10 e commento.
- Preferiti, voti e commenti vengono salvati in `localStorage` sul dispositivo e sul browser corrente; non vengono inviati a un database o all'API TMDB.
- Layout adattivo per smartphone e desktop.

Per visualizzare i dati TMDB serve una connessione Internet. Avvia il progetto con un server statico locale (ad esempio Live Server in VS Code) e apri la pagina iniziale: l'apertura diretta come file può impedire il caricamento delle richieste API.
