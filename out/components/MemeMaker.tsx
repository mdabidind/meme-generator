
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { saveAs } from 'file-saver';

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

interface TextSettings {
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isAllCaps: boolean;
  outlineColor: string;
  outlineWidth: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  opacity: number;
  textAlign: string;
  verticalAlign: string;
}

interface CanvasSpacing {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const MemeMaker: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [activeTab, setActiveTab] = useState('upload');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [customText, setCustomText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [showDraw, setShowDraw] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [spacing, setSpacing] = useState<CanvasSpacing>({ top: 0, bottom: 0, left: 0, right: 0 });

  const [textSettings, setTextSettings] = useState<TextSettings>({
    fontSize: 32,
    fontFamily: 'Impact',
    color: '#ffffff',
    isBold: true,
    isItalic: false,
    isAllCaps: true,
    outlineColor: '#000000',
    outlineWidth: 2,
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowBlur: 5,
    opacity: 100,
    textAlign: 'center',
    verticalAlign: 'center'
  });

  const fontFamilies = [
    'Impact', 'Arial', 'Helvetica', 'Comic Sans MS', 'Times New Roman', 'Courier New',
    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Avant Garde',
    'Trebuchet MS', 'Arial Black', 'Tahoma', 'Century Gothic', 'Lucida Console',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro',
    'Raleway', 'PT Sans', 'Lora', 'Merriweather', 'Nunito', 'Ubuntu',
    'Playfair Display', 'Poppins', 'Muli', 'Work Sans', 'Fira Sans', 'Crimson Text',
    'Dancing Script', 'Pacifico', 'Lobster', 'Righteous', 'Bangers', 'Creepster',
    'Fredoka One', 'Bungee', 'Shadows Into Light', 'Permanent Marker', 'Kalam',
    'Caveat', 'Indie Flower', 'Architects Daughter', 'Amatic SC', 'Gloria Hallelujah'
  ];

  const memeTemplates: MemeTemplate[] = [
    { id: '1', name: 'Distracted Boyfriend', url: 'https://readdy.ai/api/search-image?query=distracted%20boyfriend%20meme%20template%20with%20three%20people%2C%20man%20looking%20back%20at%20another%20woman%20while%20girlfriend%20pulls%20his%20arm%2C%20white%20background%2C%20meme%20format&width=300&height=225&seq=meme1&orientation=landscape' },
    { id: '2', name: 'Woman Yelling at Cat', url: 'https://readdy.ai/api/search-image?query=woman%20yelling%20at%20cat%20meme%20template%2C%20blonde%20woman%20pointing%20and%20yelling%20at%20white%20cat%20sitting%20at%20dinner%20table%2C%20two%20panel%20meme%20format&width=300&height=225&seq=meme2&orientation=landscape' },
    { id: '3', name: 'Drake Pointing', url: 'https://readdy.ai/api/search-image?query=drake%20pointing%20meme%20template%2C%20rapper%20drake%20in%20two%20poses%2C%20top%20rejecting%20with%20hand%2C%20bottom%20approving%20and%20pointing%2C%20yellow%20background&width=300&height=300&seq=meme3&orientation=squarish' },
    { id: '4', name: 'Expanding Brain', url: 'https://readdy.ai/api/search-image?query=expanding%20brain%20meme%20template%2C%20four%20panels%20showing%20brain%20evolution%20from%20small%20to%20glowing%2C%20gradient%20background%2C%20vertical%20layout&width=250&height=400&seq=meme4&orientation=portrait' },
    { id: '5', name: 'Change My Mind', url: 'https://readdy.ai/api/search-image?query=change%20my%20mind%20meme%20template%2C%20man%20sitting%20at%20table%20with%20sign%2C%20outdoor%20university%20campus%20setting%2C%20debate%20format&width=300&height=225&seq=meme5&orientation=landscape' },
    { id: '6', name: 'This is Fine', url: 'https://readdy.ai/api/search-image?query=this%20is%20fine%20meme%20template%2C%20cartoon%20dog%20sitting%20in%20burning%20room%20with%20coffee%2C%20everything%20is%20on%20fire%2C%20calm%20expression&width=300&height=225&seq=meme6&orientation=landscape' },
    { id: '7', name: 'Two Buttons', url: 'https://readdy.ai/api/search-image?query=two%20buttons%20meme%20template%2C%20cartoon%20character%20sweating%20looking%20at%20two%20red%20buttons%2C%20difficult%20choice%20situation&width=300&height=300&seq=meme7&orientation=squarish' },
    { id: '8', name: 'Surprised Pikachu', url: 'https://readdy.ai/api/search-image?query=surprised%20pikachu%20meme%20template%2C%20yellow%20pokemon%20with%20shocked%20expression%2C%20wide%20open%20mouth%2C%20cartoon%20style&width=300&height=225&seq=meme8&orientation=landscape' },
    { id: '9', name: 'Mocking SpongeBob', url: 'https://readdy.ai/api/search-image?query=mocking%20spongebob%20meme%20template%2C%20spongebob%20squarepants%20character%20making%20mocking%20gesture%20with%20bent%20posture%2C%20yellow%20cartoon%20character&width=300&height=225&seq=meme9&orientation=landscape' },
    { id: '10', name: 'Galaxy Brain', url: 'https://readdy.ai/api/search-image?query=galaxy%20brain%20meme%20template%2C%20four%20panel%20brain%20expansion%20showing%20progression%20from%20normal%20to%20cosmic%20enlightenment%2C%20glowing%20effects&width=250&height=400&seq=meme10&orientation=portrait' },
    { id: '11', name: 'Stonks', url: 'https://readdy.ai/api/search-image?query=stonks%20meme%20template%2C%203D%20rendered%20businessman%20in%20suit%20pointing%20upward%2C%20stock%20market%20graph%20background%2C%20financial%20success&width=300&height=225&seq=meme11&orientation=landscape' },
    { id: '12', name: 'Dogge', url: 'https://readdy.ai/api/search-image?query=doge%20meme%20template%2C%20shiba%20inu%20dog%20with%20funny%20expression%2C%20colorful%20comic%20sans%20text%20overlay%2C%20much%20wow%20very%20meme&width=300&height=300&seq=meme12&orientation=squarish' },
    { id: '13', name: 'Grumpy Cat', url: 'https://readdy.ai/api/search-image?query=grumpy%20cat%20meme%20template%2C%20white%20and%20brown%20cat%20with%20permanently%20grumpy%20expression%2C%20frowning%20face%2C%20internet%20famous%20cat&width=300&height=225&seq=meme13&orientation=landscape' },
    { id: '14', name: 'Success Kid', url: 'https://readdy.ai/api/search-image?query=success%20kid%20meme%20template%2C%20baby%20with%20clenched%20fist%20showing%20determination%20and%20success%2C%20beach%20background%2C%20victory%20pose&width=300&height=225&seq=meme14&orientation=landscape' },
    { id: '15', name: 'Crying Jordan', url: 'https://readdy.ai/api/search-image?query=crying%20jordan%20meme%20template%2C%20michael%20jordan%20crying%20face%2C%20basketball%20player%20with%20tears%2C%20emotional%20sports%20moment&width=300&height=225&seq=meme15&orientation=landscape' },
    { id: '16', name: 'Roll Safe', url: 'https://readdy.ai/api/search-image?query=roll%20safe%20meme%20template%2C%20man%20pointing%20at%20his%20temple%20with%20knowing%20expression%2C%20thinking%20gesture%2C%20smart%20idea%20pose&width=300&height=225&seq=meme16&orientation=landscape' },
    { id: '17', name: 'Kermit Tea', url: 'https://readdy.ai/api/search-image?query=kermit%20sipping%20tea%20meme%20template%2C%20kermit%20the%20frog%20drinking%20tea%20with%20hood%20on%2C%20but%20thats%20none%20of%20my%20business&width=300&height=225&seq=meme17&orientation=landscape' },
    { id: '18', name: 'Hide The Pain Harold', url: 'https://readdy.ai/api/search-image?query=hide%20the%20pain%20harold%20meme%20template%2C%20elderly%20man%20with%20forced%20smile%20hiding%20discomfort%2C%20stock%20photo%20style%20portrait&width=300&height=225&seq=meme18&orientation=landscape' },
    { id: '19', name: 'Disaster Girl', url: 'https://readdy.ai/api/search-image?query=disaster%20girl%20meme%20template%2C%20young%20girl%20smiling%20in%20front%20of%20burning%20house%2C%20devious%20expression%2C%20fire%20in%20background&width=300&height=225&seq=meme19&orientation=landscape' },
    { id: '20', name: 'Ancient Aliens', url: 'https://readdy.ai/api/search-image?query=ancient%20aliens%20meme%20template%2C%20man%20with%20wild%20hair%20making%20explaining%20gesture%2C%20history%20channel%2C%20aliens%20explanation&width=300&height=225&seq=meme20&orientation=landscape' },
    { id: '21', name: 'Philosoraptor', url: 'https://readdy.ai/api/search-image?query=philosoraptor%20meme%20template%2C%20velociraptor%20dinosaur%20in%20thinking%20pose%20with%20hand%20on%20chin%2C%20philosophical%20questions&width=300&height=300&seq=meme21&orientation=squarish' },
    { id: '22', name: 'Shut Up And Take My Money', url: 'https://readdy.ai/api/search-image?query=shut%20up%20and%20take%20my%20money%20meme%20template%2C%20futurama%20character%20holding%20money%2C%20eager%20to%20buy%20something&width=300&height=225&seq=meme22&orientation=landscape' },
    { id: '23', name: 'First World Problems', url: 'https://readdy.ai/api/search-image?query=first%20world%20problems%20meme%20template%2C%20woman%20with%20concerned%20expression%2C%20minor%20inconvenience%20complaint%2C%20privileged%20problems&width=300&height=225&seq=meme23&orientation=landscape' },
    { id: '24', name: 'Condescending Wonka', url: 'https://readdy.ai/api/search-image?query=condescending%20wonka%20meme%20template%2C%20gene%20wilder%20as%20willy%20wonka%20with%20sarcastic%20smile%2C%20tell%20me%20more%20expression&width=300&height=225&seq=meme24&orientation=landscape' },
    { id: '25', name: 'Not Sure If', url: 'https://readdy.ai/api/search-image?query=not%20sure%20if%20meme%20template%2C%20futurama%20fry%20squinting%20with%20suspicious%20expression%2C%20unsure%20about%20something&width=300&height=225&seq=meme25&orientation=landscape' },
    { id: '26', name: 'One Does Not Simply', url: 'https://readdy.ai/api/search-image?query=one%20does%20not%20simply%20meme%20template%2C%20boromir%20from%20lord%20of%20the%20rings%20explaining%20something%2C%20pointing%20gesture&width=300&height=225&seq=meme26&orientation=landscape' },
    { id: '27', name: 'Overly Attached Girlfriend', url: 'https://readdy.ai/api/search-image?query=overly%20attached%20girlfriend%20meme%20template%2C%20young%20woman%20with%20intense%20stare%20and%20creepy%20smile%2C%20clingy%20relationship&width=300&height=225&seq=meme27&orientation=landscape' },
    { id: '28', name: 'Pepe The Frog', url: 'https://readdy.ai/api/search-image?query=pepe%20the%20frog%20meme%20template%2C%20green%20cartoon%20frog%20with%20various%20emotions%2C%20internet%20culture%20mascot&width=300&height=300&seq=meme28&orientation=squarish' },
    { id: '29', name: 'Y U No', url: 'https://readdy.ai/api/search-image?query=y%20u%20no%20guy%20meme%20template%2C%20rage%20comic%20character%20with%20angry%20expression%2C%20arms%20raised%20in%20frustration&width=300&height=225&seq=meme29&orientation=landscape' },
    { id: '30', name: 'Sudden Clarity Clarence', url: 'https://readdy.ai/api/search-image?query=sudden%20clarity%20clarence%20meme%20template%2C%20young%20man%20with%20wide%20eyes%20having%20sudden%20realization%2C%20moment%20of%20understanding&width=300&height=225&seq=meme30&orientation=landscape' },
    { id: '31', name: 'Good Guy Greg', url: 'https://readdy.ai/api/search-image?query=good%20guy%20greg%20meme%20template%2C%20man%20in%20knit%20hat%20with%20friendly%20smile%2C%20helpful%20person%2C%20positive%20vibes&width=300&height=225&seq=meme31&orientation=landscape' },
    { id: '32', name: 'Scumbag Steve', url: 'https://readdy.ai/api/search-image?query=scumbag%20steve%20meme%20template%2C%20young%20man%20in%20sideways%20cap%20with%20smirk%2C%20bad%20friend%20behavior&width=300&height=225&seq=meme32&orientation=landscape' },
    { id: '33', name: 'Bad Luck Brian', url: 'https://readdy.ai/api/search-image?query=bad%20luck%20brian%20meme%20template%2C%20awkward%20teenager%20with%20braces%20and%20messy%20hair%2C%20unfortunate%20situations&width=300&height=225&seq=meme33&orientation=landscape' },
    { id: '34', name: 'Socially Awkward Penguin', url: 'https://readdy.ai/api/search-image?query=socially%20awkward%20penguin%20meme%20template%2C%20cartoon%20penguin%20looking%20uncomfortable%2C%20social%20anxiety%20situations&width=300&height=300&seq=meme34&orientation=squarish' },
    { id: '35', name: 'Insanity Wolf', url: 'https://readdy.ai/api/search-image?query=insanity%20wolf%20meme%20template%2C%20wolf%20with%20crazy%20eyes%20and%20bared%20teeth%2C%20extreme%20actions%2C%20wild%20behavior&width=300&height=300&seq=meme35&orientation=squarish' },
    { id: '36', name: 'College Freshman', url: 'https://readdy.ai/api/search-image?query=college%20freshman%20meme%20template%2C%20young%20student%20with%20naive%20expression%2C%20university%20life%20beginnings&width=300&height=225&seq=meme36&orientation=landscape' },
    { id: '37', name: 'Skeptical Third World Kid', url: 'https://readdy.ai/api/search-image?query=skeptical%20third%20world%20kid%20meme%20template%2C%20young%20child%20with%20questioning%20expression%2C%20cultural%20differences&width=300&height=225&seq=meme37&orientation=landscape' },
    { id: '38', name: 'Advice Dog', url: 'https://readdy.ai/api/search-image?query=advice%20dog%20meme%20template%2C%20golden%20retriever%20puppy%20with%20colorful%20background%2C%20giving%20advice%20format&width=300&height=300&seq=meme38&orientation=squarish' },
    { id: '39', name: 'Courage Wolf', url: 'https://readdy.ai/api/search-image?query=courage%20wolf%20meme%20template%2C%20determined%20wolf%20face%20with%20motivational%20background%2C%20inspirational%20quotes&width=300&height=300&seq=meme39&orientation=squarish' },
    { id: '40', name: 'Forever Alone', url: 'https://readdy.ai/api/search-image?query=forever%20alone%20meme%20template%2C%20sad%20face%20drawing%20with%20lonely%20expression%2C%20single%20life%20struggles&width=300&height=300&seq=meme40&orientation=squarish' },
    { id: '41', name: 'Troll Face', url: 'https://readdy.ai/api/search-image?query=troll%20face%20meme%20template%2C%20mischievous%20grinning%20face%20drawing%2C%20internet%20trolling%20culture&width=300&height=300&seq=meme41&orientation=squarish' },
    { id: '42', name: 'Me Gusta', url: 'https://readdy.ai/api/search-image?query=me%20gusta%20meme%20template%2C%20creepy%20pleased%20face%20expression%2C%20enjoying%20something%20weird&width=300&height=300&seq=meme42&orientation=squarish' },
    { id: '43', name: 'Rage Guy', url: 'https://readdy.ai/api/search-image?query=rage%20guy%20meme%20template%2C%20angry%20face%20with%20wide%20open%20mouth%2C%20frustration%20and%20anger&width=300&height=300&seq=meme43&orientation=squarish' },
    { id: '44', name: 'Okay Guy', url: 'https://readdy.ai/api/search-image?query=okay%20guy%20meme%20template%2C%20sad%20disappointed%20face%20looking%20down%2C%20acceptance%20of%20defeat&width=300&height=300&seq=meme44&orientation=squarish' },
    { id: '45', name: 'Challenge Accepted', url: 'https://readdy.ai/api/search-image?query=challenge%20accepted%20meme%20template%2C%20determined%20face%20with%20confident%20expression%2C%20ready%20for%20action&width=300&height=300&seq=meme45&orientation=squarish' },
    { id: '46', name: 'Arthur Fist', url: 'https://readdy.ai/api/search-image?query=arthur%20fist%20meme%20template%2C%20cartoon%20aardvark%20character%20with%20clenched%20fist%2C%20angry%20reaction&width=300&height=225&seq=meme46&orientation=landscape' },
    { id: '47', name: 'Blinking White Guy', url: 'https://readdy.ai/api/search-image?query=blinking%20white%20guy%20meme%20template%2C%20man%20with%20confused%20blinking%20expression%2C%20reaction%20gif%20format&width=300&height=225&seq=meme47&orientation=landscape' },
    { id: '48', name: 'Expanding Drake', url: 'https://readdy.ai/api/search-image?query=expanding%20drake%20meme%20template%2C%20multiple%20drake%20reactions%20from%20rejecting%20to%20extremely%20approving%2C%20escalating%20preference&width=300&height=400&seq=meme48&orientation=portrait' },
    { id: '49', name: 'Monkey Puppet', url: 'https://readdy.ai/api/search-image?query=monkey%20puppet%20meme%20template%2C%20puppet%20looking%20away%20awkwardly%20then%20back%2C%20uncomfortable%20situation%20reaction&width=300&height=225&seq=meme49&orientation=landscape' },
    { id: '50', name: 'Winnie The Pooh', url: 'https://readdy.ai/api/search-image?query=winnie%20the%20pooh%20meme%20template%2C%20bear%20in%20regular%20clothes%20vs%20fancy%20tuxedo%2C%20classy%20upgrade%20comparison&width=300&height=300&seq=meme50&orientation=squarish' }
  ];

  const emojis = ['😀', '😂', '😭', '😍', '🤔', '😎', '🔥', '💯', '👍', '👎', '❤️', '💔', '😴', '🤯', '🙄', '😏', '🤗', '😱', '🤪', '😇', '🚀', '⭐', '💎', '🎉', '🌟', '💪', '👑', '🎯', '⚡', '🌈'];

  const stickers = [
    '🌸', '🌺', '🌻', '🌷', '🌹', '🌿', '🍀', '🌱', '🌳', '🦋',
    '🐝', '🐞', '🦄', '🌙', '☀️', '⭐', '✨', '💫', '🌟', '🔥'
  ];

  const saveCanvasState = () => {
    if (!fabricCanvas) return;

    const canvasState = JSON.stringify(fabricCanvas.toJSON());
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(canvasState);

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (!fabricCanvas || historyIndex <= 0) return;

    const previousState = canvasHistory[historyIndex - 1];
    fabricCanvas.loadFromJSON(previousState, () => {
      fabricCanvas.renderAll();
      setHistoryIndex(historyIndex - 1);
    });
  };

  const redo = () => {
    if (!fabricCanvas || historyIndex >= canvasHistory.length - 1) return;

    const nextState = canvasHistory[historyIndex + 1];
    fabricCanvas.loadFromJSON(nextState, () => {
      fabricCanvas.renderAll();
      setHistoryIndex(historyIndex + 1);
    });
  };

  useEffect(() => {
    if (canvasRef.current && !fabricCanvas) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth + spacing.left + spacing.right,
        height: canvasHeight + spacing.top + spacing.bottom,
        backgroundColor: backgroundColor
      });

      canvas.on('selection:created', (e) => {
        setSelectedObject(e.selected?.[0] || null);
      });

      canvas.on('selection:updated', (e) => {
        setSelectedObject(e.selected?.[0] || null);
      });

      canvas.on('selection:cleared', () => {
        setSelectedObject(null);
      });

      canvas.on('object:modified', () => {
        saveCanvasState();
      });

      canvas.on('object:added', () => {
        setTimeout(saveCanvasState, 100);
      });

      setFabricCanvas(canvas);

      setTimeout(() => {
        const initialState = JSON.stringify(canvas.toJSON());
        setCanvasHistory([initialState]);
        setHistoryIndex(0);
      }, 100);
    }

    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (fabricCanvas) {
      const totalWidth = canvasWidth + spacing.left + spacing.right;
      const totalHeight = canvasHeight + spacing.top + spacing.bottom;

      fabricCanvas.setWidth(totalWidth);
      fabricCanvas.setHeight(totalHeight);
      fabricCanvas.setBackgroundColor(backgroundColor, fabricCanvas.renderAll.bind(fabricCanvas));

      fabricCanvas.setViewportTransform([1, 0, 0, 1, spacing.left, spacing.top]);
    }
  }, [canvasWidth, canvasHeight, backgroundColor, spacing, fabricCanvas]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && fabricCanvas) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgUrl = e.target?.result as string;
          setUploadedImages(prev => [...prev, imgUrl]);

          fabric.Image.fromURL(imgUrl, (img) => {
            img.scaleToWidth(300);
            img.set({
              left: spacing.left + Math.random() * 200,
              top: spacing.top + Math.random() * 200,
            });
            fabricCanvas.add(img);
            fabricCanvas.renderAll();
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addImageFromGallery = (imgUrl: string) => {
    if (!fabricCanvas) return;

    fabric.Image.fromURL(imgUrl, (img) => {
      img.scaleToWidth(200);
      img.set({
        left: spacing.left + Math.random() * 200,
        top: spacing.top + Math.random() * 200,
      });
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
    });
  };

  const addText = (text: string, position: 'top' | 'bottom' | 'custom') => {
    if (!fabricCanvas || !text.trim()) return;

    const textObj = new fabric.Text(textSettings.isAllCaps ? text.toUpperCase() : text, {
      left: position === 'custom' ? spacing.left + 100 : (canvasWidth + spacing.left + spacing.right) / 2,
      top: position === 'top' ? spacing.top + 50 : position === 'bottom' ? canvasHeight + spacing.top - 100 : spacing.top + 200,
      fontSize: textSettings.fontSize,
      fontFamily: textSettings.fontFamily,
      fill: textSettings.color,
      fontWeight: textSettings.isBold ? 'bold' : 'normal',
      fontStyle: textSettings.isItalic ? 'italic' : 'normal',
      stroke: textSettings.outlineColor,
      strokeWidth: textSettings.outlineWidth,
      textAlign: textSettings.textAlign as any,
      originX: 'center',
      originY: position === 'top' ? 'top' : position === 'bottom' ? 'bottom' : 'center',
      opacity: textSettings.opacity / 100
    });

    if (textSettings.shadowEnabled) {
      textObj.set({
        shadow: new fabric.Shadow({
          color: textSettings.shadowColor,
          blur: textSettings.shadowBlur,
          offsetX: 2,
          offsetY: 2
        })
      });
    }

    fabricCanvas.add(textObj);
    fabricCanvas.setActiveObject(textObj);
    fabricCanvas.renderAll();
  };

  const addEmoji = (emoji: string) => {
    if (!fabricCanvas) return;

    const emojiObj = new fabric.Text(emoji, {
      left: spacing.left + Math.random() * (canvasWidth - 100),
      top: spacing.top + Math.random() * (canvasHeight - 100),
      fontSize: 48,
      fontFamily: 'Arial'
    });

    fabricCanvas.add(emojiObj);
    fabricCanvas.renderAll();
  };

  const loadMemeTemplate = (template: MemeTemplate) => {
    if (!fabricCanvas) return;

    fabric.Image.fromURL(template.url, (img) => {
      fabricCanvas.clear();
      img.scaleToFit(canvasWidth, canvasHeight);
      img.set({
        left: (canvasWidth + spacing.left + spacing.right) / 2,
        top: (canvasHeight + spacing.top + spacing.bottom) / 2,
        originX: 'center',
        originY: 'center'
      });
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
    });
  };

  const applyFilter = (filterType: string) => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      const imgElement = (activeObject as fabric.Image).getElement() as HTMLImageElement;

      switch (filterType) {
        case 'grayscale':
          (activeObject as fabric.Image).filters = [new fabric.Image.filters.Grayscale()];
          break;
        case 'invert':
          (activeObject as fabric.Image).filters = [new fabric.Image.filters.Invert()];
          break;
        case 'brightness':
          (activeObject as fabric.Image).filters = [new fabric.Image.filters.Brightness({ brightness: 0.3 })];
          break;
        case 'contrast':
          (activeObject as fabric.Image).filters = [new fabric.Image.filters.Contrast({ contrast: 0.3 })];
          break;
        case 'sepia':
          (activeObject as fabric.Image).filters = [new fabric.Image.filters.Sepia()];
          break;
        case 'blur':
          (activeObject as fabric.Image).filters = [new fabric.Image.filters.Blur({ blur: 0.5 })];
          break;
      }

      (activeObject as fabric.Image).applyFilters();
      fabricCanvas.renderAll();
    }
  };

  const enableDrawing = () => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = !isDrawing;
    setIsDrawing(!isDrawing);

    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = brushSize;
      fabricCanvas.freeDrawingBrush.color = brushColor;
    }
  };

  const duplicateSelected = () => {
    if (!fabricCanvas || !selectedObject) return;

    selectedObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
    });
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.setBackgroundColor(backgroundColor, fabricCanvas.renderAll.bind(fabricCanvas));
  };

  const downloadImage = (format: 'png' | 'jpeg') => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: format,
      quality: 0.9,
      multiplier: 2
    });

    const link = document.createElement('a');
    link.download = `meme.${format}`;
    link.href = dataURL;
    link.click();
  };

  const deleteSelected = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.renderAll();
  };

  const bringToFront = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.bringToFront(selectedObject);
    fabricCanvas.renderAll();
  };

  const sendToBack = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.sendToBack(selectedObject);
    fabricCanvas.renderAll();
  };

  const flipHorizontal = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    fabricCanvas.renderAll();
  };

  const flipVertical = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    fabricCanvas.renderAll();
  };

  const rotateObject = (angle: number) => {
    if (!fabricCanvas || !selectedObject) return;
    const currentAngle = selectedObject.angle || 0;
    selectedObject.set('angle', currentAngle + angle);
    fabricCanvas.renderAll();
  };

  const scaleObject = (scale: number) => {
    if (!fabricCanvas || !selectedObject) return;
    const currentScaleX = selectedObject.scaleX || 1;
    const currentScaleY = selectedObject.scaleY || 1;
    selectedObject.set({
      scaleX: Math.max(0.1, currentScaleX * scale),
      scaleY: Math.max(0.1, currentScaleY * scale)
    });
    fabricCanvas.renderAll();
  };

  const setObjectOpacity = (opacity: number) => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.set('opacity', opacity / 100);
    fabricCanvas.renderAll();
  };

  const lockObject = () => {
    if (!fabricCanvas || !selectedObject) return;
    const isLocked = selectedObject.lockMovementX;
    selectedObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      selectable: isLocked
    });
    fabricCanvas.renderAll();
  };

  const centerObject = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.center();
    fabricCanvas.renderAll();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 py-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Advanced Meme Maker & Editor
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Create amazing memes with our powerful all-in-one editor
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Mobile-First Tools Panel */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 p-4 md:p-6 sticky top-4">
              {/* History Controls - Mobile Optimized */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className={`flex-1 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${historyIndex <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:scale-[1.02]'}`}
                >
                  <i className="ri-arrow-left-line mr-1"></i>
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= canvasHistory.length - 1}
                  className={`flex-1 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${historyIndex >= canvasHistory.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:scale-[1.02]'}`}
                >
                  <i className="ri-arrow-right-line mr-1"></i>
                  Redo
                </button>
              </div>

              {/* Tab Navigation - Mobile Scrollable */}
              <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {[{
                    id: 'upload',
                    label: 'Upload',
                    icon: 'ri-upload-line',
                    color: 'emerald'
                  }, {
                    id: 'text',
                    label: 'Text',
                    icon: 'ri-text',
                    color: 'orange'
                  }, {
                    id: 'templates',
                    label: 'Templates',
                    icon: 'ri-image-line',
                    color: 'purple'
                  }, {
                    id: 'emojis',
                    label: 'Emojis',
                    icon: 'ri-emotion-line',
                    color: 'yellow'
                  }, {
                    id: 'stickers',
                    label: 'Stickers',
                    icon: 'ri-price-tag-3-line',
                    color: 'green'
                  }, {
                    id: 'filters',
                    label: 'Filters',
                    icon: 'ri-contrast-line',
                    color: 'indigo'
                  }, {
                    id: 'spacing',
                    label: 'Spacing',
                    icon: 'ri-space',
                    color: 'cyan'
                  }, {
                    id: 'draw',
                    label: 'Draw',
                    icon: 'ri-pencil-line',
                    color: 'pink'
                  }].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${activeTab === tab.id
                        ? tab.color === 'emerald' ? 'bg-emerald-500 text-white shadow-md' :
                          tab.color === 'orange' ? 'bg-orange-500 text-white shadow-md' :
                          tab.color === 'purple' ? 'bg-purple-500 text-white shadow-md' :
                          tab.color === 'yellow' ? 'bg-yellow-500 text-white shadow-md' :
                          tab.color === 'green' ? 'bg-green-500 text-white shadow-md' :
                          tab.color === 'indigo' ? 'bg-indigo-500 text-white shadow-md' :
                          tab.color === 'cyan' ? 'bg-cyan-500 text-white shadow-md' :
                          tab.color === 'pink' ? 'bg-pink-500 text-white shadow-md' :
                          'bg-blue-500 text-white shadow-md'
                      }`}
                    >
                      <i className={`${tab.icon} mr-1`}></i>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content - Optimized for Mobile */}
              <div className="space-y-4">
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {uploadedImages.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image Gallery</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                          {uploadedImages.map((imgUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imgUrl}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all duration-200 transform hover:scale-105"
                                onClick={() => addImageFromGallery(imgUrl)}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <i className="ri-add-line text-white text-lg"></i>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                        <input
                          type="number"
                          value={canvasWidth}
                          onChange={(e) => setCanvasWidth(Number(e.target.value))}
                          className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                        <input
                          type="number"
                          value={canvasHeight}
                          onChange={(e) => setCanvasHeight(Number(e.target.value))}
                          className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <button
                      onClick={clearCanvas}
                      className="w-full px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                    >
                      <i className="ri-delete-bin-line mr-2"></i>
                      Clear Canvas
                    </button>
                  </div>
                )}

                {activeTab === 'templates' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800 text-base">Meme Templates</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {memeTemplates.slice(0, 20).map((template) => (
                        <div
                          key={template.id}
                          className="group bg-gray-50 border border-gray-200 rounded-xl p-2 hover:bg-gray-100 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                          onClick={() => loadMemeTemplate(template)}
                        >
                          <img
                            src={template.url}
                            alt={template.name}
                            className="w-full h-16 object-cover rounded-lg mb-2"
                          />
                          <p className="text-xs font-medium text-gray-700 text-center leading-tight">{template.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Top Text</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={topText}
                          onChange={(e) => setTopText(e.target.value)}
                          placeholder="Enter top text"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => addText(topText, 'top')}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bottom Text</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bottomText}
                          onChange={(e) => setBottomText(e.target.value)}
                          placeholder="Enter bottom text"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => addText(bottomText, 'bottom')}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Text</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="Enter custom text"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => addText(customText, 'custom')}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={textSettings.fontSize}
                          onChange={(e) => setTextSettings({ ...textSettings, fontSize: Number(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{textSettings.fontSize}px</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Font</label>
                        <select
                          value={textSettings.fontFamily}
                          onChange={(e) => setTextSettings({ ...textSettings, fontFamily: e.target.value })}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs pr-8"
                        >
                          {fontFamilies.slice(0, 20).map((font) => (
                            <option key={font} value={font}>
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                        <input
                          type="color"
                          value={textSettings.color}
                          onChange={(e) => setTextSettings({ ...textSettings, color: e.target.value })}
                          className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Outline</label>
                        <input
                          type="color"
                          value={textSettings.outlineColor}
                          onChange={(e) => setTextSettings({ ...textSettings, outlineColor: e.target.value })}
                          className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTextSettings({ ...textSettings, isBold: !textSettings.isBold })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${textSettings.isBold ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        B
                      </button>
                      <button
                        onClick={() => setTextSettings({ ...textSettings, isItalic: !textSettings.isItalic })}
                        className={`px-3 py-1.5 rounded-lg text-sm italic transition-colors ${textSettings.isItalic ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        I
                      </button>
                      <button
                        onClick={() => setTextSettings({ ...textSettings, isAllCaps: !textSettings.isAllCaps })}
                        className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${textSettings.isAllCaps ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        ABC
                      </button>
                    </div>

                    {selectedObject && (
                      <div className="pt-3 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3 text-sm">Selected Object</h4>

                        {/* Position & Layer Controls */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <button
                            onClick={bringToFront}
                            className="px-2 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-bring-to-front mr-1"></i>
                            Front
                          </button>
                          <button
                            onClick={sendToBack}
                            className="px-2 py-1.5 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-send-to-back mr-1"></i>
                            Back
                          </button>
                          <button
                            onClick={centerObject}
                            className="px-2 py-1.5 bg-cyan-500 text-white rounded-lg text-xs hover:bg-cyan-600 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-focus-line mr-1"></i>
                            Center
                          </button>
                        </div>

                        {/* Flip Controls */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <button
                            onClick={flipHorizontal}
                            className="px-2 py-1.5 bg-indigo-500 text-white rounded-lg text-xs hover:bg-indigo-600 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-flip-horizontal-line mr-1"></i>
                            Flip H
                          </button>
                          <button
                            onClick={flipVertical}
                            className="px-2 py-1.5 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-flip-vertical-line mr-1"></i>
                            Flip V
                          </button>
                        </div>

                        {/* Rotation Controls */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Rotate</label>
                          <div className="grid grid-cols-4 gap-1">
                            <button
                              onClick={() => rotateObject(-90)}
                              className="px-2 py-1.5 bg-orange-400 text-white rounded-lg text-xs hover:bg-orange-500 transition-colors whitespace-nowrap"
                            >
                              -90°
                            </button>
                            <button
                              onClick={() => rotateObject(-15)}
                              className="px-2 py-1.5 bg-orange-400 text-white rounded-lg text-xs hover:bg-orange-500 transition-colors whitespace-nowrap"
                            >
                              -15°
                            </button>
                            <button
                              onClick={() => rotateObject(15)}
                              className="px-2 py-1.5 bg-orange-500 text-white rounded-lg text-xs hover:bg-orange-600 transition-colors whitespace-nowrap"
                            >
                              +15°
                            </button>
                            <button
                              onClick={() => rotateObject(90)}
                              className="px-2 py-1.5 bg-orange-500 text-white rounded-lg text-xs hover:bg-orange-600 transition-colors whitespace-nowrap"
                            >
                              +90°
                            </button>
                          </div>
                        </div>

                        {/* Scale Controls */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Scale</label>
                          <div className="grid grid-cols-4 gap-1">
                            <button
                              onClick={() => scaleObject(0.5)}
                              className="px-2 py-1.5 bg-red-400 text-white rounded-lg text-xs hover:bg-red-500 transition-colors whitespace-nowrap"
                            >
                              50%
                            </button>
                            <button
                              onClick={() => scaleObject(0.8)}
                              className="px-2 py-1.5 bg-red-400 text-white rounded-lg text-xs hover:bg-red-500 transition-colors whitespace-nowrap"
                            >
                              80%
                            </button>
                            <button
                              onClick={() => scaleObject(1.2)}
                              className="px-2 py-1.5 bg-green-400 text-white rounded-lg text-xs hover:bg-green-500 transition-colors whitespace-nowrap"
                            >
                              120%
                            </button>
                            <button
                              onClick={() => scaleObject(2)}
                              className="px-2 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors whitespace-nowrap"
                            >
                              200%
                            </button>
                          </div>
                        </div>

                        {/* Opacity Control */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Opacity</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue="100"
                            onChange={(e) => setObjectOpacity(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {/* Action Controls */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={duplicateSelected}
                            className="px-2 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-file-copy-line mr-1"></i>
                            Copy
                          </button>
                          <button
                            onClick={lockObject}
                            className="px-2 py-1.5 bg-gray-500 text-white rounded-lg text-xs hover:bg-gray-600 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-lock-line mr-1"></i>
                            Lock
                          </button>
                          <button
                            onClick={deleteSelected}
                            className="px-2 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors whitespace-nowrap"
                          >
                            <i className="ri-delete-bin-line mr-1"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'emojis' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Emojis</h3>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => addEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'stickers' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Stickers</h3>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                      {stickers.map((sticker, index) => (
                        <button
                          key={index}
                          onClick={() => addEmoji(sticker)}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        >
                          {sticker}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'spacing' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Canvas Spacing</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Top</label>
                        <input
                          type="number"
                          value={spacing.top}
                          onChange={(e) => setSpacing({ ...spacing, top: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bottom</label>
                        <input
                          type="number"
                          value={spacing.bottom}
                          onChange={(e) => setSpacing({ ...spacing, bottom: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Left</label>
                        <input
                          type="number"
                          value={spacing.left}
                          onChange={(e) => setSpacing({ ...spacing, left: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Right</label>
                        <input
                          type="number"
                          value={spacing.right}
                          onChange={(e) => setSpacing({ ...spacing, right: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'filters' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Image Filters</h3>
                    <div className="grid grid-cols-2 gap-2">
                      [{
                        name: 'Grayscale',
                        value: 'grayscale'
                      }, {
                        name: 'Invert',
                        value: 'invert'
                      }, {
                        name: 'Brightness',
                        value: 'brightness'
                      }, {
                        name: 'Contrast',
                        value: 'contrast'
                      }, {
                        name: 'Sepia',
                        value: 'sepia'
                      }, {
                        name: 'Blur',
                        value: 'blur'
                      }].map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => applyFilter(filter.value)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors text-gray-700"
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'draw' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Drawing Tools</h3>
                    <button
                      onClick={enableDrawing}
                      className={`w-full px-4 py-2.5 rounded-lg font-medium transition-colors ${isDrawing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
                    </button>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brush Size</label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{brushSize}px</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brush Color</label>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Canvas Area - Mobile Responsive */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Canvas Editor
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => downloadImage('png')}
                    className="px-4 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg text-sm"
                  >
                    <i className="ri-download-line mr-2"></i>
                    Download PNG
                  </button>
                  <button
                    onClick={() => downloadImage('jpeg')}
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg text-sm"
                  >
                    <i className="ri-download-line mr-2"></i>
                    Download JPG
                  </button>
                </div>
              </div>

              <div className="flex justify-center overflow-auto">
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white max-w-full">
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeMaker;
