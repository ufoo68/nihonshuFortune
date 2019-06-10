import * as functions from 'firebase-functions';
import Express from 'express';
import * as Clova from '@line/clova-cek-sdk-nodejs';

const extensionId : string = functions.config().clova.extension.id;

const clovaSkillHandler = Clova.Client
    .configureSkill()

    //起動時に喋る
    .onLaunchRequest((responseHelper: { setSimpleSpeech: (arg0: { lang: string; type: string; value: string; }) => Clova.Context; }) => {
        responseHelper.setSimpleSpeech(Clova.SpeechBuilder.createSpeechText(`日本酒診断をします。２つの質問に答えてください。飲み方はヒヤか、熱燗、どちらがいいですか？`))
        .setSessionAttributes({}); //Attributesの初期化
    })

    //ユーザーからの発話が来たら反応する箇所
    .onIntentRequest(async (responseHelper: { 
        getIntentName: () => string; 
        getSlot: (slotName: string) => string; 
        getSessionAttributes: () => {drinkType?: string; tasteType?: string};
        setSimpleSpeech: { (arg0: { lang: string; type: string; value: string; }): Clova.Context;
        (arg0: Clova.Clova.SpeechInfoText, arg1: boolean): void; }; }) => {
        const intent = responseHelper.getIntentName();
        const drinkType = responseHelper.getSlot('drinkType') ? responseHelper.getSlot('drinkType') : responseHelper.getSessionAttributes().drinkType;
        const tasteType = responseHelper.getSlot('tasteType') ? responseHelper.getSlot('tasteType') : responseHelper.getSessionAttributes().tasteType;

        switch (intent) {
            case 'howDrinkIntent':
                if (drinkType && tasteType) {
                    responseHelper.setSimpleSpeech(Clova.SpeechBuilder.createSpeechText(`${drinkType}で飲む${tasteType}のタニガワダケをオススメします。`))
                    .endSession();
                }
                else {
                    responseHelper.setSimpleSpeech(Clova.SpeechBuilder.createSpeechText(`甘口か、辛口、どちらがいいですか？`))
                    .setSessionAttributes({drinkType: drinkType});
                }
                break;

            case 'howTasteIntent':
                if (drinkType && tasteType) {
                    responseHelper.setSimpleSpeech(Clova.SpeechBuilder.createSpeechText(`${drinkType}で飲む${tasteType}のタニガワダケをオススメします。`))
                    .endSession();
                }
                else {
                    responseHelper.setSimpleSpeech(Clova.SpeechBuilder.createSpeechText(`飲み方は冷か、燗、どちらがいいですか？`))
                    .setSessionAttributes({tasteType: tasteType});
                }
                break;

            default:
                responseHelper.setSimpleSpeech(Clova.SpeechBuilder.createSpeechText(`もう一度お願いします`));
                break;
        }
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
