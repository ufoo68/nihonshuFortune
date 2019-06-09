import * as functions from 'firebase-functions';
import Express from 'express';
import * as Clova from '@line/clova-cek-sdk-nodejs';

const extensionId : string = functions.config().clova.extension.id;

const clovaSkillHandler = Clova.Client
    .configureSkill()

    //起動時に喋る
    .onLaunchRequest((responseHelper: { setSimpleSpeech: (arg0: { lang: string; type: string; value: string; }) => void; }) => {
        responseHelper.setSimpleSpeech({
            lang: 'ja',
            type: 'PlainText',
            value: `日本酒診断をします。いくつかの質問に答えてください。`,
        });
    })

    //ユーザーからの発話が来たら反応する箇所
    .onIntentRequest(async (responseHelper: { 
        getIntentName: () => string; getSlots: () => string; setSimpleSpeech: { (arg0: { lang: string; type: string; value: string; }): void; (arg0: Clova.Clova.SpeechInfoText, arg1: boolean): void; }; }) => {
        const intent = responseHelper.getIntentName();
        //const slots = responseHelper.getSlots();

        console.log('Intent:' + intent);

        let speech = {
            lang: 'ja',
            type: 'PlainText',
            value:  `${intent}のインテントを受け取りました`
        }

        responseHelper.setSimpleSpeech(speech);
        responseHelper.setSimpleSpeech(
            Clova.SpeechBuilder.createSpeechText('開発中です'), true
        );
    })

    //終了時
    .onSessionEndedRequest((responseHelper: { getSessionId: () => void; }) => {
        //const sessionId = responseHelper.getSessionId();
    })
    .handle();

const app = Express();

const clovaMiddleware = Clova.Middleware({applicationId: extensionId});
app.use( function (req, res, next) {
    req.body = JSON.stringify(req.body)
    next()
})
app.post('/clova', clovaMiddleware, <Express.RequestHandler>clovaSkillHandler);

exports.clova = functions.https.onRequest(app);
