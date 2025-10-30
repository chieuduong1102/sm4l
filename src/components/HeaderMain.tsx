import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderMainProps {
    title?: string;
    onBackPress?: () => void;
    showBackButton?: boolean;
}

const HeaderMain: React.FC<HeaderMainProps> = ({
    title = 'Smoney4life',
    onBackPress,
    showBackButton = true,
}) => {
    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            console.log('Back button pressed');
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    {/* Back Button - Left Side */}
                    <View style={styles.leftSection}>
                        {showBackButton && (
                            <TouchableOpacity
                                onPress={handleBackPress}
                                style={styles.backButton}
                                activeOpacity={0.7}
                            >
                                <FontAwesomeIcon
                                    icon={['fas', 'arrow-left']}
                                    size={20}
                                    color="#1a365d"
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Title - Right Side */}
                    <View style={styles.rightSection}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 56,
    },
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    rightSection: {
        flex: 3,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        minWidth: 40,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        textAlign: 'right',
    },
});

export default HeaderMain;