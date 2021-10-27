import { BackHandler } from 'react-native';
import { act } from 'react-dom/test-utils';
import { injectable } from 'react-magnetic-di';
import {
    mountWithDi,
    runHookWithDi,
    createMockComponent
} from '@codexporer.io/react-test-utils';
import { useTheme, Portal } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import {
    useFloatingSlider,
    Root,
    SliderWrapper,
    POSITION
} from './floating-slider';

jest.mock('react-native/Libraries/Utilities/BackHandler', () => ({
    addEventListener: jest.fn()
}));

jest.mock('expo-constants', () => ({
    statusBarHeight: 50
}));

describe('useFloatingSlider', () => {
    const useIsFocusedMock = jest.fn();
    const removeBackHandler = jest.fn();
    const deps = [
        injectable(Portal, createMockComponent('Portal')),
        injectable(Root, createMockComponent('Root')),
        injectable(Slider, createMockComponent('Slider')),
        injectable(SliderWrapper, createMockComponent('SliderWrapper')),
        injectable(useIsFocused, useIsFocusedMock),
        injectable(useTheme, () => ({
            colors: {
                primary: 'primaryColorMock',
                backgroundDarker: 'backgroundDarkerColorMock'
            }
        }))
    ];
    const defaultProps = {
        value: 0,
        onValueChange: jest.fn()
    };

    beforeEach(() => {
        useIsFocusedMock.mockReturnValue(true);
        BackHandler.addEventListener.mockReturnValue({ remove: removeBackHandler });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render null when not visible', () => {
        const result = runHookWithDi(
            () => useFloatingSlider(defaultProps),
            { deps }
        );

        expect(result.hookResult.renderSlider()).toBe(null);
    });

    it('should render component when visible', () => {
        const result = runHookWithDi(
            () => useFloatingSlider({
                ...defaultProps,
                maximumValue: 'maximumValueMock',
                minimumValue: 'minimumValueMock',
                value: 'mockValue'
            }),
            { deps }
        );

        act(() => {
            result.hookResult.showSlider();
            result.update();
        });

        expect(result.hookResult.renderSlider()).not.toBe(null);

        const wrapper = mountWithDi(
            result.hookResult.renderSlider(),
            { deps }
        );

        expect(wrapper.name()).toBe('Portal');
        // eslint-disable-next-line lodash/prefer-lodash-method
        expect(wrapper.find('TouchableWithoutFeedback').find('Slider').props()).toEqual({
            maximumTrackTintColor: 'backgroundDarkerColorMock',
            maximumValue: 'maximumValueMock',
            minimumTrackTintColor: 'primaryColorMock',
            minimumValue: 'minimumValueMock',
            onValueChange: expect.any(Function),
            value: 'mockValue'
        });
    });

    it('should hide slider when clicking outside', async () => {
        const result = runHookWithDi(
            () => useFloatingSlider(defaultProps),
            { deps }
        );
        act(() => {
            result.hookResult.showSlider();
            result.update();
        });
        expect(result.hookResult.renderSlider()).not.toBe(null);

        act(() => {
            // eslint-disable-next-line lodash/prefer-lodash-method
            mountWithDi(
                result.hookResult.renderSlider(),
                { deps }
            ).find('TouchableWithoutFeedback').prop('onPress')();
            result.update();
        });

        expect(result.hookResult.renderSlider()).toBe(null);
    });

    it('should call onValueChange with new value', async () => {
        const result = runHookWithDi(
            () => useFloatingSlider(defaultProps),
            { deps }
        );
        act(() => {
            result.hookResult.showSlider();
            result.update();
        });

        // eslint-disable-next-line lodash/prefer-lodash-method
        mountWithDi(
            result.hookResult.renderSlider(),
            { deps }
        ).find('Slider').prop('onValueChange')(10);

        expect(defaultProps.onValueChange).toHaveBeenCalledTimes(1);
        expect(defaultProps.onValueChange).toHaveBeenCalledWith(10);
    });

    describe('Back Handler', () => {
        it('should hide slider and remove back handler on back', async () => {
            let backHandler;
            BackHandler.addEventListener.mockImplementation((eventName, handler) => {
                expect(eventName).toEqual('hardwareBackPress');
                backHandler = handler;
                return { remove: removeBackHandler };
            });
            const result = runHookWithDi(
                () => useFloatingSlider(defaultProps),
                { deps }
            );
            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(0);
            act(() => {
                result.hookResult.showSlider();
                result.update();
            });
            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
            expect(result.hookResult.renderSlider()).not.toBe(null);
            expect(removeBackHandler).toHaveBeenCalledTimes(0);

            await act(async () => {
                backHandler();
                result.update();
            });

            expect(result.hookResult.renderSlider()).toBe(null);
            expect(removeBackHandler).toHaveBeenCalledTimes(1);
        });

        it('should not call back handler addEventListener when not visible', () => {
            runHookWithDi(
                () => useFloatingSlider(defaultProps),
                { deps }
            );

            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(0);
        });

        it('should not call back handler addEventListener when not focused', () => {
            useIsFocusedMock.mockReturnValue(false);
            const result = runHookWithDi(
                () => useFloatingSlider(defaultProps),
                { deps }
            );
            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(0);

            act(() => {
                result.hookResult.showSlider();
                result.update();
            });

            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(0);
        });
    });

    describe('Positioning', () => {
        const mountWithLayout = ({ position }) => {
            const result = runHookWithDi(
                () => useFloatingSlider({
                    ...defaultProps,
                    position
                }),
                { deps }
            );
            act(() => {
                result.hookResult.showSlider();
                result.update();
            });
            const wrapper = mountWithDi(
                result.hookResult.renderSlider(),
                { deps }
            );
            act(() => {
                // eslint-disable-next-line lodash/prefer-lodash-method
                wrapper.find('Root').prop('onLayout')({ nativeEvent: { layout: { width: 1000, height: 200 } } });
                // eslint-disable-next-line lodash/prefer-lodash-method
                wrapper.find('SliderWrapper').prop('onLayout')({ nativeEvent: { layout: { height: 100 } } });
                result.update();
            });

            return mountWithDi(
                result.hookResult.renderSlider(),
                { deps }
            );
        };

        it('should position properly on left', async () => {
            const wrapper = mountWithLayout({ position: POSITION.left });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('SliderWrapper').props()).toEqual({
                bottomOffset: null,
                leftOffset: 460,
                rightOffset: 460,
                style: {
                    transform: [
                        { rotate: '-90deg' },
                        { translateX: -50 },
                        { translateY: -400 }
                    ]
                },
                topOffset: null,
                children: expect.any(Object),
                onLayout: expect.any(Function)
            });
        });

        it('should position properly on top', async () => {
            const wrapper = mountWithLayout({ position: POSITION.top });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('SliderWrapper').props()).toEqual({
                bottomOffset: null,
                leftOffset: 10,
                rightOffset: 10,
                topOffset: 100,
                children: expect.any(Object),
                onLayout: expect.any(Function)
            });
        });

        it('should position properly on right', async () => {
            const wrapper = mountWithLayout({ position: POSITION.right });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('SliderWrapper').props()).toEqual({
                bottomOffset: null,
                leftOffset: 460,
                rightOffset: 460,
                style: {
                    transform: [
                        {
                            rotate: '-90deg'
                        },
                        {
                            translateX: -50
                        },
                        {
                            translateY: 400
                        }
                    ]
                },
                topOffset: null,
                children: expect.any(Object),
                onLayout: expect.any(Function)
            });
        });

        it('should position properly on bottom', async () => {
            const wrapper = mountWithLayout({ position: POSITION.bottom });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(wrapper.find('SliderWrapper').props()).toEqual({
                bottomOffset: 50,
                leftOffset: 10,
                rightOffset: 10,
                topOffset: null,
                children: expect.any(Object),
                onLayout: expect.any(Function)
            });
        });
    });
});
