
# AI Image Classifier

A responsive web application that uses a real pretrained MobileNet model to identify objects in uploaded images. Built with HTML, CSS, JavaScript, and TensorFlow.js.

## Features

- Upload and preview JPG, PNG, and WEBP images.
- Predict image categories using a pretrained AI model.
- Display the top 3 prediction labels.
- Show confidence percentages and visual progress bars.
- Responsive layout for mobile and desktop.
- No API key or backend required.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- TensorFlow.js
- MobileNet image classification model

## How to Run

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Make sure your internet connection is active.
4. Wait until the status says "AI model ready".
5. Upload an image and click **Classify Image**.

You can also publish the project with GitHub Pages.

## Internet and Model Requirements

The TensorFlow.js library, MobileNet library, and pretrained model are loaded from online CDNs and model hosting when the app starts. An internet connection is required for the initial loading unless all dependencies and model files are downloaded and configured locally.

No API key, server, or model training is required. Image classification runs in the browser after the model loads.

## Model Limitations

MobileNet recognizes categories from its pretrained ImageNet label set. It may not recognize every object, and predictions are not guaranteed to be correct. Confidence scores are model estimates, not proof of accuracy.

## Privacy

The application processes the selected image in the browser. The image is not intentionally uploaded to an application server by this code. External libraries and model files are downloaded from their hosting providers.

## License

This project code may be reused and modified for educational purposes. Check the licenses of the third-party libraries and pretrained model before redistribution.

