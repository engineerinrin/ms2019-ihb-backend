import request from 'request';
import { gcvApiKey } from './config';

export const imageAnalysisRequest = (base64Image: string) => {
  return new Promise((resolve, reject) => {
    request.post({
      url: `https://vision.googleapis.com/v1/images:annotate?key=${gcvApiKey}`,
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 20,
              },
            ],
          },
        ],
      }),
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
};

export const geoCodingRequest = (lat: number, lng: number) => {
  return new Promise((resolve, reject) => {
    request.get({
      url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${gcvApiKey}&language=ja`,
      headers: {
        'Content-type': 'application/json',
      },
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
};
