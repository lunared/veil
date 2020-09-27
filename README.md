# Veil - Anonymous Chat Service

Veil performs interest-based matchmaking to create a session between two strangers to meet one another and chat freely.  Unmoderated and lacking persistence, it provides a discrete, fun, temporal way to discovery someone new to chat with.

Veil is and forever will be a text-based service, to provide an accessible and judgement free social environment.

# Starting Veil 

Two services are present for establishing the Veil server: 
- web.js
This process handles websockets, captcha auth, and serves the Vue SPA
- worker.js
The worker process handles matchmaking and cleaning up expired data from redis.  Matchmaking is managed using Bull queues

It is required that you have a redis existing somewhere in order to communicate with the service.  To prevent bots and malicious actors on the platform, we use recaptcha v2.

Veil is designed to be easily deployable onto Heroku.  If you do not wish to use heroku itself, you can just do local heroku deployments, or run the scripts directly using node/npm.
