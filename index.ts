import { login } from './api';
import { APIQueueID } from './types';

login(`AccessToken`)
.then(user => {
    const match = user.match();
    match.history({ queueId: APIQueueID.Competitive }).then(history => {
        const firstMatch = history?.getLastMatch();
        console.log(firstMatch);
        firstMatch?.getDetails().then(details => {
            details?.players.forEach(player => {
                console.log(player.gameName, " -> ", player.character?.name);
            });
        });
    });
})
.catch(err => {
    console.log("Error: ", err.message);
});
