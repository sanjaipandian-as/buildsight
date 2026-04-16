# Ollama Setup Guide for BuildSight

## What is Ollama?

Ollama is a local AI model runner that lets you run vision models (like LLaVA) on your own computer. This means:
- ✅ **Privacy**: Images never leave your computer
- ✅ **Free**: No API costs
- ✅ **Fast**: Local processing
- ✅ **Offline**: Works without internet

## Installation

### 1. Install Ollama

**Windows:**
```bash
# Download from: https://ollama.com/download/windows
# Or use winget:
winget install Ollama.Ollama
```

**Mac:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Install LLaVA Model

LLaVA is a vision model that can analyze images. Install it with:

```bash
ollama pull llava
```

This will download the model (~4.5GB). Wait for it to complete.

### 3. Verify Installation

Check if Ollama is running:

```bash
ollama list
```

You should see `llava` in the list.

### 4. Test the Model

Test image analysis:

```bash
ollama run llava "What do you see in this image?" --image path/to/test-image.jpg
```

## Configuration

Your `.env` file is already configured:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llava
```

## How It Works in BuildSight

1. **User points camera at their build**
2. **User asks a question** (e.g., "What components do you see?")
3. **App captures camera frame** (as JPEG)
4. **Sends to local Ollama** at `http://localhost:11434`
5. **LLaVA analyzes the image** and generates response
6. **AI speaks the response** using browser's text-to-speech
7. **User hears what AI sees** in their speakers/headphones

## Example Interaction

**User shows Arduino board to camera and asks:**
> "What do you see?"

**AI responds (and speaks):**
> "I can see an Arduino Uno board on your workspace. There's also a breadboard, some jumper wires, and what appears to be an LED. The components look ready for assembly. You have everything needed for Step 1."

## Troubleshooting

### Ollama Not Running

**Error:** `fetch failed` or `ECONNREFUSED`

**Solution:**
```bash
# Start Ollama service
ollama serve
```

Keep this terminal open while using the app.

### Model Not Found

**Error:** `model 'llava' not found`

**Solution:**
```bash
ollama pull llava
```

### Slow Analysis

**Issue:** Takes 10-30 seconds to analyze

**This is normal for local models.** Speed depends on:
- Your CPU/GPU
- Image size (we use 640x480 to optimize)
- Model size

**To speed up:**
- Use a smaller model: `ollama pull llava:7b`
- Reduce image quality in code
- Use GPU acceleration if available

### Voice Not Working

**Issue:** AI response shows but doesn't speak

**Check:**
1. Voice toggle is ON (speaker icon in top-right)
2. Browser has audio permissions
3. System volume is up
4. Try different browser (Chrome/Edge work best)

## Alternative Models

You can try other vision models:

```bash
# Smaller, faster model
ollama pull llava:7b

# Larger, more accurate model  
ollama pull llava:13b

# Specialized for technical tasks
ollama pull bakllava
```

Update `.env`:
```env
OLLAMA_MODEL=llava:7b
```

## Performance Tips

### For Better Accuracy:
- Good lighting on your build
- Camera focused and stable
- Ask specific questions
- Show components clearly

### For Faster Response:
- Use smaller model (`llava:7b`)
- Close other apps
- Use GPU if available
- Keep questions concise

## Testing Your Setup

1. **Start Ollama:**
   ```bash
   ollama serve
   ```

2. **Start BuildSight:**
   ```bash
   npm run dev
   ```

3. **Go to a project session**

4. **Allow camera access**

5. **Point camera at any object**

6. **Ask:** "What do you see?"

7. **Listen for AI response**

If you hear the AI describing what it sees, everything is working! 🎉

## Common Questions

**Q: Does this work offline?**
A: Yes! Once the model is downloaded, no internet needed.

**Q: Is my camera feed sent anywhere?**
A: No. Everything runs locally on your computer.

**Q: Can I use this on mobile?**
A: Ollama runs on desktop only. For mobile, use Gemini API instead.

**Q: How much RAM do I need?**
A: Minimum 8GB, recommended 16GB for smooth operation.

**Q: Can I use my GPU?**
A: Yes! Ollama automatically uses GPU if available (NVIDIA/AMD).

## Next Steps

Once Ollama is working:
1. ✅ Test with different objects
2. ✅ Try various questions
3. ✅ Adjust voice settings
4. ✅ Build something real!

Need help? Check Ollama docs: https://ollama.com/docs
