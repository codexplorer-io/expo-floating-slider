# expo-floating-slider
Floating slider component for react-native & expo.

## Platform Compatibility
iOS|Android|Web|
-|-|-|
✅|✅|❌|

## Samples
<img title="video" src="https://github.com/codexplorer-io/expo-floating-slider/blob/main/samples/video.gif?raw=true">

<img title="left" src="https://github.com/codexplorer-io/expo-floating-slider/blob/main/samples/left.png?raw=true" width="20%"> <img title="top" src="https://github.com/codexplorer-io/expo-floating-slider/blob/main/samples/top.png?raw=true" width="20%"> <img title="right" src="https://github.com/codexplorer-io/expo-floating-slider/blob/main/samples/right.png?raw=true" width="20%"> <img title="bottom" src="https://github.com/codexplorer-io/expo-floating-slider/blob/main/samples/bottom.png?raw=true" width="20%">

## Usage
```javascript
import { useFloatingSlider } from '@codexporer.io/expo-floating-slider';
...

export const MyComponent = () => {
    const [imageOpacity, setImageOpacity] = useState(1);
    const {
        renderSlider: renderOpacitySlider,
        showSlider: showOpacitySlider
    } = useFloatingSlider({
        value: opacity,
        onValueChange: setOpacity,
        minimumValue: 0,
        maximumValue: 1
    });
    ...
    
    return (
        <>
            <Button onPress={showOpacitySlider}>Show Slider</Button>
            <StyledView opacity={opacity} />
            {renderOpacitySlider()}
        </>
    );
};
```

## Exports
symbol|description|
-|-|
useFloatingSlider|hook used for slider rendering|
POSITION|constant used for slider positioning relative to the screen edge|

## useFloatingSlider
Takes options and returns `showSlider` (used to show the slider) and `renderSlider` (used to render the slider) functions.

### Options
option|description|
-|-|
value|slider value|
onValueChange|callback called when slider value changes (`newValue => { ... }`)|
minimumValue|slider minimum value (default: 0)|
maximumValue|slider maximum value (default: 1)|
position|slider position (POSITION.left, POSITION.top, POSITION.right or POSITION.bottom) (default: POSITION.top)|
offset|offset from the *position* edge (eg. if position is POSITION.left, offset is calculated from the left edge) (default: 50)|
