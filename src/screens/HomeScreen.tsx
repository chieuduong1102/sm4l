import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Xin chào!</Text>
                    <Text style={styles.subtitle}>SMoney4Life</Text>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Tổng chi tiêu tháng này</Text>
                        <Text style={styles.statValue}>0 VNĐ</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                    <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                    <View style={styles.actionButtons}>
                        <View style={styles.actionButton}>
                            <Text style={styles.actionText}>Thêm giao dịch</Text>
                        </View>
                        <View style={styles.actionButton}>
                            <Text style={styles.actionText}>Xem báo cáo</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View style={styles.recentContainer}>
                    <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                    </View>
                </View>

                {/* Add space for bottom tab bar */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 24,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    statsContainer: {
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a365d',
    },
    actionsContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a365d',
        marginBottom: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#1a365d',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },
    recentContainer: {
        marginBottom: 24,
    },
    emptyState: {
        backgroundColor: '#ffffff',
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
    },
    bottomSpacing: {
        height: 100, // Space for bottom tab bar
    },
});

export default HomeScreen;