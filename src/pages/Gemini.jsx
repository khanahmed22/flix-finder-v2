import { GoogleGenAI } from "@google/genai"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export default function Gemini(){

   const [mood,setMood] = useState("")
  

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY
  })

  const fetchAIResp = async ()=>{
    try{
      const resp = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `I am in a ${mood} so recommend me a single film`,
      })
      return resp?.text || ""
    }
    catch(error){
      console.log(error)
    }
  }

 
  const {data: geminiResp, isPending} = useQuery({
    queryKey: ['gemini-query', mood],
    queryFn: fetchAIResp
  }) 

 

  
  return (
    <div className="min-h-screen">
      <h2>Gemini</h2>
      <input value={mood} onChange={(e)=> setMood(e.target.value)}/> 
      <div>
        {!isPending ? geminiResp : <p>No Response</p>}
      </div>
    </div>
  )
}