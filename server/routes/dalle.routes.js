import express from 'express';

import fs from 'fs'
import { PNG } from 'pngjs'

const router = express.Router()

router.route('/').get((req, res) => {
    res.status(200).json({ message: "Hello from DALL.E ROUTES" })
})

router.route('/').post(async(req, res) => {

    try {

        const {prompt} = req.body;
        
        const pipe = await DiffusionPipeline.fromPretrained('aislamov/stable-diffusion-2-1-base-onnx', { revision: 'cpu' })
        const images = await pipe.run({
            prompt: prompt,
            negativePrompt: '',
            numInferenceSteps: 30,
            sdV1: 1,
            height: 768,
            width: 768,
            guidanceScale: 7.5,
            img2imgFlag: false,
          })
        
        const data = await images[0].mul(255).round().clipByValue(0, 255).transpose(0, 2, 3, 1)

        const p = new PNG({ width: 512, height: 512, inputColorType: 2 })
        p.data = Buffer.from(data.data)
        p.pack().pipe(fs.createWriteStream('output.png')).on('finish', () => {
        console.log('Image saved as output.png');
        })
                
        const image = 'base64';

        res.status(200).json({ photo: image })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Something went wrong!' })
    }
})

export default router