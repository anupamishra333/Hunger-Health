const express = require("express");
const app = express();
const port = 1234;
const { google } = require("googleapis");
const request = require("request");
const cors = require("cors");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const axios = require("axios");
const URLParse = require("url-parse");


// 28363671574-887t6gimfl9jsbv6knulnbetv6nmgthc.apps.googleusercontent.com
// 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

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/getURLTing", (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        // client id
        "28363671574-887t6gimfl9jsbv6knulnbetv6nmgthc.apps.googleusercontent.com",
        // client secret
        "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",
        // link to redirect
        "http://localhost:1234/steps"
    )
    const scopes = [ "https://www.googleapis.com/auth/fitness.activity.read profile email openid"]

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        state: JSON.stringify({
            callbackUrl: req.body.callbackUrl,
            userID: req.body.userid
        })
    })

    request(url, (err, response, body) => {
        console.log("error: ", err);
        console.log("statusCode: ", response && response.statusCode);
        res.send({ url });
    });
});

app.get("/steps", async (req, res) => {
    const queryURL = new URLParse(req.url);
    const code = queryParse.parse(queryURL.query).code;

    const oauth2Client = new google.auth.OAuth2(
        // 994762349980-tti9sgak80noq94v47hmc002b3jca44q.apps.googleusercontent.com
        "28363671574-887t6gimfl9jsbv6knulnbetv6nmgthc.apps.googleusercontent.com",
        // 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
        "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",
        // link to redirect
        "http://localhost:1234/steps"
    );

    var tokens = await oauth2Client.getToken(code);
    // console.log(tokens);

    res.send("HELLO");

    let stepArray = [];

    try{
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer " + tokens.tokens.access_token
            },
            "Content-Type": "application/json; charset=utf-8",
            url: 'https://www.googleapis.com/fitness/v1/users/me/dataSources/',
            data: JSON.stringify({
                aggregateBy: [
                    {
                        dataTypeName: "com.google.step_count.delta",
                        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                    },
                ],
                bucketByTime: { durationMillis: 86400000 },
                startTimeMillis: 1585785599000,
                endTimeMillis: 1585958399000,
            }),
        });
        // console.log(result);
        stepArray = result.data.bucket
    } catch(e) {
        console.log(e);
    }

    try{
        for(const dataSet of stepArray){
            // console.log(dataSet);
            for(const points of dataSet.dataset){
                // console.log(points);
                for(const steps of points.point){
                    console.log(steps.value);
                }
            }
        }
    }catch(e) {
        console.log(e);
    }
});

app.listen(port, () => console.log(`Google Fit app listening on PORT: ${port}!`));