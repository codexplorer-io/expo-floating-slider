import React, { useState, useEffect, useCallback } from 'react';
import { di } from 'react-magnetic-di';
import { useTheme, Portal } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import Constants from 'expo-constants';
import { StyleSheet, BackHandler, TouchableWithoutFeedback } from 'react-native';
import styled, { css } from 'styled-components/native';
import Slider from '@react-native-community/slider';

const absoluteFillStyle = css(StyleSheet.absoluteFillObject);

export const Root = styled.View`
    ${absoluteFillStyle}
    background-color: transparent;
`;

export const SliderWrapper = styled.View`
    position: absolute;
    ${({ leftOffset }) => leftOffset !== null ? css`left: ${leftOffset}px;` : null}
    ${({ topOffset }) => topOffset !== null ? css`top: ${topOffset}px;` : null}
    ${({ rightOffset }) => rightOffset !== null ? css`right: ${rightOffset}px;` : null}
    ${({ bottomOffset }) => bottomOffset !== null ? css`bottom: ${bottomOffset}px;` : null}
    padding: 10px;
    background-color: ${({ theme: { colors: { background } } }) => background};
    border: ${({ theme: { colors: { primary } } }) => `2px solid ${primary}`};
    flex: 1;
`;

export const POSITION = {
    left: 'left',
    top: 'top',
    right: 'right',
    bottom: 'bottom'
};

export const useFloatingSlider = ({
    value,
    onValueChange,
    minimumValue = 0,
    maximumValue = 1,
    position = POSITION.top,
    offset = 50
}) => {
    di(
        Portal,
        Root,
        Slider,
        SliderWrapper,
        TouchableWithoutFeedback,
        useIsFocused,
        useState,
        useTheme
    );

    const theme = useTheme();
    const [rootHeight, setRootHeight] = useState(0);
    const [rootWidth, setRootWidth] = useState(0);
    const [wrapperHeight, setWrapperHeight] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const isFocused = useIsFocused();

    const showSlider = useCallback(() => setIsVisible(true), [setIsVisible]);
    const hideSlider = useCallback(() => setIsVisible(false), [setIsVisible]);

    const handleRootLayout = ({ nativeEvent: { layout: { width, height } } }) => {
        setRootWidth(width);
        setRootHeight(height);
    };

    const wrapperProps = {
        leftOffset: null,
        rightOffset: null,
        topOffset: null,
        bottomOffset: null,
        onLayout: ({ nativeEvent: { layout: { height } } }) => {
            setWrapperHeight(height);
        }
    };

    switch (position) {
        case POSITION.left:
            wrapperProps.leftOffset = (rootWidth - rootHeight) / 2 +
                Constants.statusBarHeight + 10;
            wrapperProps.rightOffset = (rootWidth - rootHeight) / 2 +
                Constants.statusBarHeight + 10;
            wrapperProps.style = {
                transform: [
                    { rotate: '-90deg' },
                    { translateX: 0 - rootHeight / 2 + wrapperHeight / 2 },
                    { translateY: 0 - rootWidth / 2 + wrapperHeight / 2 + offset }
                ]
            };
            break;
        case POSITION.right:
            wrapperProps.leftOffset = (rootWidth - rootHeight) / 2 +
                Constants.statusBarHeight + 10;
            wrapperProps.rightOffset = (rootWidth - rootHeight) / 2 +
                Constants.statusBarHeight + 10;
            wrapperProps.style = {
                transform: [
                    { rotate: '-90deg' },
                    { translateX: 0 - rootHeight / 2 + wrapperHeight / 2 },
                    { translateY: rootWidth / 2 - wrapperHeight / 2 - offset }
                ]
            };
            break;
        case POSITION.top:
            wrapperProps.topOffset = Constants.statusBarHeight + offset;
            wrapperProps.leftOffset = 10;
            wrapperProps.rightOffset = 10;
            break;
        case POSITION.bottom:
            wrapperProps.bottomOffset = offset;
            wrapperProps.leftOffset = 10;
            wrapperProps.rightOffset = 10;
            break;
        default:
            break;
    }

    const renderSlider = () => isVisible ? (
        <Portal>
            <TouchableWithoutFeedback onPress={hideSlider}>
                <Root onLayout={handleRootLayout}>
                    <SliderWrapper {...wrapperProps}>
                        <Slider
                            minimumTrackTintColor={theme.colors.primary}
                            maximumTrackTintColor={theme.colors.backgroundDarker}
                            value={value}
                            onValueChange={onValueChange}
                            minimumValue={minimumValue}
                            maximumValue={maximumValue}
                        />
                    </SliderWrapper>
                </Root>
            </TouchableWithoutFeedback>
        </Portal>
    ) : null;

    useEffect(() => {
        const handler = isVisible && isFocused && BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                hideSlider();
                return true;
            }
        );

        return () => handler && handler.remove();
    }, [
        hideSlider,
        isFocused,
        isVisible
    ]);

    return {
        showSlider,
        renderSlider
    };
};
