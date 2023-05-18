import internal = require("stream");

import {Config} from "./config";

const superagent = require("superagent");

// Endpoint for the OpenAI API edits
const EDIT_URL = "https://api.openai.com/v1/edits";


/**
 * Send a request to the OpenAI server to get the tokens following prompt.
 */
export const getNextTokens = async (prompt: string,
                                    config: Config,
                                    apiKey: string
                                    ): Promise<string> => new Promise((resolve, reject) => {

    superagent
	.post(EDIT_URL)
	// .send({ /* eslint-disable @typescript-eslint/naming-convention */
	// 	prompt: prompt,
	// 	temperature: config.temperature,
	// 	max_tokens: config.maxTokens,
	// 	top_p: config.topP,
	// 	presence_penalty: config.presencePenalty,
	// 	frequency_penalty: config.frequencyPenalty,
	// 	stop: config.stop.length === 0 ? null : config.stop // API does not accept empty array
	// })
	// .send({ // for chat/completions
	// 	model: "gpt-3.5-turbo", // code-davinci-002 // gpt-3.5-turbo
	// 	temperature: 0.7,
	// 	messages: [{"role": "user", "content": prompt}],
	// })
	.send({
		"model": "code-davinci-edit-001",
		"input": prompt,
		"instruction": "Predict the following code",
		"temperature": 0.3
	})
	.set("Authorization", "Bearer " + apiKey)
	.end((error: any, response: any) => {
		if (error) {
			let message: string;
            // If the API specified an error message, return it.
			if (error.response.text) {
				message = JSON.parse(error.response.text).error.message;
			} else {
				message = error;
			}
		reject(new Error(message));
		return;
		}

		const resp = JSON.parse(response.text);
		
		if (resp["choices"].length === 0) {
			reject(new Error("No code returned by the server."));
		} else {
			resolve(String(resp["choices"][0]["text"]));
		}
	});
});

