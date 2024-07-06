import axios from 'axios'; 
import { Request, Response } from 'express'; 

const gptKey = 'sk-proj-eVYh2F10727O9vShDfjjT3BlbkFJfj4U4FkJRGeRjtFDsj03';
const scraperAuthKey = "Basic UzAwMDAxODAwMTA6UFdfMWM5N2M2Y2VjYTYwNThkYjc1MzFlMTcwNTE4MDNiZmI0"; 

export const getInfo = async (req: Request, res: Response) => {
try {
    // fetch tiktok data from scraper 
    const { description, location } = await getVideoData(req.body.url); 
    const combinedData = description + ' ' + location || description || location; 

    if(!combinedData){ // tiktok does not exist
        res.status(300).send("TikTok does not exist");
    }

    const isPresent = await isAddressPresent(combinedData); 

    if(isPresent){ // if address and location are already available 
        const locationObj = await getAddress(combinedData); 

        // temp solution 
        res.send(locationObj); 
        // @todo save this address to DB
        console.log(locationObj); 
    } else {
        res.send("CV analysis coming soon...");
    }
  } catch(err:any){ // bad request
    console.log(err); 
    res.status(400).send("Something went wrong...");
  }
}

// Helper functions ================================================================================
/**
 * fetches data on a tiktok
 * @param url video url
 * @return an option containing the data
 */
const getVideoData = async (url:String) => {
    console.log("Fetching video data..."); 

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': scraperAuthKey, 
            'Accept': 'application/json'
          }
      
          const axiosData = {
            target : "tiktok_post",
            url : url, 
            locale : "en-us"
          }
      
          const { data } = await axios.post("https://scraper-api.smartproxy.com/v2/scrape", axiosData, { headers }); 
      
          const description = data.results[0]?.content?.itemInfo?.itemStruct?.desc ?? null; 
          const location = data.results[0]?.content?.itemInfo?.itemStruct?.poi?.address ?? null; 

          const combinedObj = {
            description, 
            location
          }

          console.log(combinedObj);
          return combinedObj
    } catch(err:any){
        console.log(err); 
        throw new Error("Scraper API request failed")
    }
}

/**
 * @desc determines if location is already given in video metadata
 * @param description given description
 * @param location given location
 * @return true / false
 */

const isAddressPresent = async (data:String) => {
    console.log("Fetching GPT response..."); 

    try {
        // determine if location is already given in video metadata
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
            model: 'gpt-4o',
            messages: [
                { 
                role: 'user',
                content: `
                    Can you return a true or false value if both the name and an address for the location are given in the following data?
                    Extrapolate based on caption, hashtags, and location. The location is sometimes given after a "pin" emoji.
                    Return only "true" or "false". 
                    \n ${data}
                `,
                }
            ],
            },
            {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${gptKey}`,
            },
            }
        );

        const answer = response.data.choices[0].message.content.toLowerCase();
        console.log(answer); 

        // Check if the answer is true or false
        if (answer == "true") {
            return true;
        } else if (answer == "false") {
            return false;
        } else {
            throw new Error("Unexpected response from AI model");
        }
    } catch(err: any) {
        console.log(err);
        throw new Error("GPT API request failed")
    }
}

/**
 * @param data description containing address and location
 * @return JSON object containing name and address of a location
 */
const getAddress = async (data:String) => {
    console.log("Fetching address..."); 
    try {
        // determine if location is already given in video metadata
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
            model: 'gpt-4o',
            response_format: { "type": "json_object" }, 
            messages: [
                { 
                role: 'user',
                content: `
                Can you create a json object with the attribute "name" for the name of the location and "address" for the address of the location. 
                Please use the most specific address possible, and if it is not available, please query for possible addresses and set the "address" attribute to the most likely and SPECIFIC address. 
                Use hashtags as context clues if necessary. 
                If the location name is unclear, make up a descriptive name based on the potential foods, activities, or sights that are mentioned in the caption and / or hashtags. 
                    \n Location: ${data}
                `,
                }
            ],
            },
            {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${gptKey}`,
            },
            }
        );

        return response.data.choices[0].message.content; 
    } catch(err:any){
        console.log(err.response.data); 
        throw new Error("GPT API request failed")
    }
}