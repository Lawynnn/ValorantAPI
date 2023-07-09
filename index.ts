import { login } from './api';
import { APIQueueID } from './types';

login(`eyJraWQiOiJzMSIsImFsZyI6IlJTMjU2In0.eyJwcCI6eyJjIjoiZXUifSwic3ViIjoiZDI2MzI4ZjYtNjFjMS01YWY4LWE0YmEtNjdkZjQ1NzllMmYyIiwic2NwIjpbIm9wZW5pZCIsImxpbmsiLCJiYW4iLCJsb2xfcmVnaW9uIiwibG9sIiwic3VtbW9uZXIiLCJvZmZsaW5lX2FjY2VzcyJdLCJjbG0iOlsibG9sX2FjY291bnQiLCJlbWFpbF92ZXJpZmllZCIsIm9wZW5pZCIsInB3IiwibG9sIiwib3JpZ2luYWxfcGxhdGZvcm1faWQiLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiLCJwaG90byIsIm9yaWdpbmFsX2FjY291bnRfaWQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiLCJsb2NhbGUiLCJiYW4iLCJsb2xfcmVnaW9uIiwiYWNjdF9nbnQiLCJyZWdpb24iLCJwdnBuZXRfYWNjb3VudF9pZCIsImFjY3QiLCJ1c2VybmFtZSJdLCJkYXQiOnsicCI6bnVsbCwiYyI6ImVjMSIsImxpZCI6Imk4cy1LR18ybVltdjFUVVBXT3dtdVEifSwiaXNzIjoiaHR0cHM6XC9cL2F1dGgucmlvdGdhbWVzLmNvbSIsImV4cCI6MTY4ODkwNTU2MSwiaWF0IjoxNjg4OTAxOTYxLCJqdGkiOiJpTXRRc0k2a3RPdyIsImNpZCI6InJpb3QtY2xpZW50In0.fk_S1HIvSPfcL08wzZ1YCK0dNYgVLy317TVRa2njMQopmqXLdsVMp9OQbKp1zOx48AZ4nSvpSy1boCiU7MV1YMFiXAb-jVEjZtU9yWkpSnIX7jMB_XuWBNamLyE6cm-TDOC_Uwyf-k6BpzYiFTYwZkCGLBFNZM3d8-A7qHZVxrA`)
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