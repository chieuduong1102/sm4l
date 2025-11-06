import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';

interface ExpenseData {
    category: string;
    amount: number;
    percentage: number;
}

interface AIAnalysisProps {
    selectedMonth: string;
    pieData: any[];
    totalSpent: number;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ selectedMonth, pieData, totalSpent }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
    const [showAdvice, setShowAdvice] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const formatMoney = (amount: number) => {
        if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + ' triệu';
        if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'k';
        return amount.toString();
    };

    const generateAnalysis = () => {
        if (pieData.length === 0) return "Không có dữ liệu chi tiêu để phân tích.";
        
        const sortedCategories = pieData
            .map(item => ({
                category: item.name.split('(')[0].trim(),
                amount: item.population,
                percentage: parseFloat(item.percentage?.replace('%', '') || '0')
            }))
            .sort((a, b) => b.amount - a.amount);

        const topCategory = sortedCategories[0];
        const monthName = `${selectedMonth.slice(5, 7)}/${selectedMonth.slice(0, 4)}`;
        
        let analysis = `⁂ Phân tích chi tiêu tháng ${monthName}\n\n`;
        analysis += `💰 Tổng chi tiêu: ${formatMoney(totalSpent)} VND\n\n`;
        analysis += `🎯 Hạng mục chi tiêu hàng đầu:\n`;
        
        sortedCategories.slice(0, 3).forEach((cat, index) => {
            const emoji = ['❶', '❷', '❸'][index];
            analysis += `${emoji} ${cat.category}: ${formatMoney(cat.amount)} VND (${cat.percentage}%)\n`;
        });

        return analysis;
    };

    const generateAdvice = () => {
        if (pieData.length === 0) return [];

        const sortedCategories = pieData
            .map(item => ({
                category: item.name.split('(')[0].trim(),
                amount: item.population,
                percentage: parseFloat(item.percentage?.replace('%', '') || '0')
            }))
            .sort((a, b) => b.amount - a.amount);

        const advice = [];
        
        // Lời khuyên chung
        advice.push("🤖 Dựa trên dữ liệu chi tiêu của bạn, tôi có một số gợi ý để tối ưu hóa tài chính:");
        
        sortedCategories.forEach(cat => {
            if (cat.percentage > 30) {
                advice.push(`⚠️ **${cat.category}** chiếm ${cat.percentage}% tổng chi tiêu (${formatMoney(cat.amount)} VND). Đây là tỷ lệ khá cao, bạn nên xem xét giảm bớt.`);
            } else if (cat.percentage > 20) {
                advice.push(`💡 **${cat.category}** chiếm ${cat.percentage}% chi tiêu. Có thể tìm cách tiết kiệm một chút ở mục này.`);
            }
        });

        // Lời khuyên cụ thể theo category
        const topCategory = sortedCategories[0];
        switch (topCategory.category) {
            case 'Ăn uống':
                advice.push("🍽️ **Gợi ý tiết kiệm Ăn uống:** Nấu ăn tại nhà nhiều hơn, mang cơm trưa đi làm, hạn chế đặt đồ ăn online.");
                break;
            case 'Đi lại':
                advice.push("🚗 **Gợi ý tiết kiệm Đi lại:** Sử dụng phương tiện công cộng, đi chung xe với đồng nghiệp, hoặc đi bộ/xe đạp cho quãng đường ngắn.");
                break;
            case 'Mua sắm':
                advice.push("🛍️ **Gợi ý tiết kiệm Mua sắm:** Lập danh sách mua sắm trước khi đi, tránh mua impulse, chờ sale/khuyến mãi.");
                break;
            case 'Giải trí':
                advice.push("🎉 **Gợi ý tiết kiệm Giải trí:** Tìm các hoạt động miễn phí như công viên, bảo tàng, sự kiện community.");
                break;
        }

        advice.push("📈 **Mục tiêu:** Cố gắng giảm 10-15% chi tiêu tháng tới bằng cách áp dụng các gợi ý trên!");
        advice.push("💪 Chúc bạn thành công trong việc quản lý tài chính!");

        return advice;
    };

    const startAnalysis = async () => {
        setIsAnalyzing(true);
        setShowAnalysis(false);
        setShowAdvice(false);
        setTypingText('');
        
        // Simulate thinking time
        await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
        
        setIsAnalyzing(false);
        setShowAnalysis(true);
        
        // Start typing effect for analysis
        const analysisText = generateAnalysis();
        let currentText = '';
        for (let i = 0; i <= analysisText.length; i++) {
            currentText = analysisText.slice(0, i);
            setTypingText(currentText);
            await new Promise<void>(resolve => setTimeout(() => resolve(), 30));
        }
        
        // Wait a bit then show advice
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
        setShowAdvice(true);
        
        // Start typing advice
        const adviceList = generateAdvice();
        for (let i = 0; i < adviceList.length; i++) {
            setCurrentAdviceIndex(i);
            await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.headerCollapse} 
                onPress={() => setIsCollapsed(!isCollapsed)}
                activeOpacity={0.7}
            >
                <View style={styles.header}>
                    <Image 
                        source={require('../assets/ai_bot.jpg')} 
                        style={styles.botImage}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.botName}>AI Assistant</Text>
                        <Text style={styles.greeting}>
                            {isCollapsed 
                                ? "Nhấn để mở rộng phân tích AI..." 
                                : "Xin chào! Tôi có thể giúp bạn phân tích chi tiêu và đưa ra lời khuyên tối ưu hóa tài chính."
                            }
                        </Text>
                    </View>
                </View>
                <Text style={styles.collapseIcon}>
                    {isCollapsed ? '▼' : '▲'}
                </Text>
            </TouchableOpacity>

            {!isCollapsed && (
                <>
                    {!isAnalyzing && !showAnalysis && (
                        <TouchableOpacity style={styles.analyzeButton} onPress={startAnalysis}>
                            <Text style={styles.analyzeButtonText}>📊 Phân tích giúp tôi</Text>
                        </TouchableOpacity>
                    )}

                    {isAnalyzing && (
                        <View style={styles.thinkingContainer}>
                            <ActivityIndicator size="large" color="#2563eb" />
                            <Text style={styles.thinkingText}>Đang phân tích dữ liệu của bạn...</Text>
                        </View>
                    )}

                    {showAnalysis && (
                        <View style={styles.analysisContainer}>
                            <View style={styles.chatBubble}>
                                <Text style={styles.analysisText}>{typingText}</Text>
                            </View>
                        </View>
                    )}

                    {showAdvice && (
                        <View style={styles.adviceContainer}>
                            <Text style={styles.adviceTitle}>💡 Lời khuyên từ AI:</Text>
                            {generateAdvice().slice(0, currentAdviceIndex + 1).map((advice, index) => (
                                <View key={index} style={styles.adviceItem}>
                                    <Text style={styles.adviceText}>
                                        {advice.split('**').map((part, i) =>
                                            i % 2 === 1 ? <Text key={i} style={styles.boldText}>{part}</Text> : part
                                        )}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    botImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    botName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 4,
    },
    greeting: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    analyzeButton: {
        backgroundColor: '#1a365d',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    analyzeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    thinkingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    thinkingText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 14,
    },
    analysisContainer: {
        marginBottom: 16,
    },
    chatBubble: {
        backgroundColor: '#f1f5f9',
        padding: 12,
        borderRadius: 12,
        borderBottomLeftRadius: 4,
    },
    analysisText: {
        fontSize: 14,
        color: '#1a365d',
        lineHeight: 20,
    },
    adviceContainer: {
        marginTop: 8,
    },
    adviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 12,
    },
    adviceItem: {
        backgroundColor: '#f1f5f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#1a365d',
    },
    adviceText: {
        fontSize: 14,
        color: '#1a365d',
        lineHeight: 18,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1a365d',
    },
    headerCollapse: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    collapseIcon: {
        fontSize: 18,
        color: '#1a365d',
    },
});

export default AIAnalysis;