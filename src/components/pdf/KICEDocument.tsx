import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import { DbPassage } from '@/types/database';

// Register Nanum Myeongjo
Font.register({
    family: 'NanumMyeongjo',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/nanummyeongjo/v22/9Btx3DZF0dXLMZlywRbVRNhxy1Lu3vxcoRHoQA.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/nanummyeongjo/v22/9Btt3DZF0dXLMZlywRbVRNhxy2pLR1QJ8sWMRg.woff2', fontWeight: 700 },
    ],
});

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#ffffff',
        paddingTop: 28,
        paddingBottom: 40,
        paddingHorizontal: 36,
        fontFamily: 'NanumMyeongjo',
    },
    header: {
        textAlign: 'center',
        marginBottom: 12,
        borderBottom: '1.5pt solid #000000',
        paddingBottom: 8,
    },
    headerMain: {
        fontSize: 11,
        fontWeight: 700,
        textAlign: 'center',
        letterSpacing: 1,
    },
    headerSub: {
        fontSize: 8.5,
        textAlign: 'center',
        marginTop: 2,
        color: '#444444',
    },
    examInfoRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 6,
        marginBottom: 8,
    },
    examBox: {
        border: '1pt solid #000000',
        padding: '4 8',
        fontSize: 8,
        minWidth: 70,
    },
    examBoxLabel: {
        fontSize: 7,
        color: '#666666',
        marginBottom: 2,
    },
    examBoxInner: {
        height: 16,
        width: 80,
    },
    columns: {
        flexDirection: 'row',
        gap: 18,
        flex: 1,
    },
    column: {
        flex: 1,
    },
    passageTitle: {
        fontSize: 9.5,
        fontWeight: 700,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    passageKeyword: {
        fontSize: 8,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 10,
    },
    paragraph: {
        marginBottom: 6,
        textIndent: 12,
    },
    paragraphNum: {
        fontSize: 7.5,
        color: '#888888',
        marginBottom: 2,
        fontWeight: 700,
    },
    paragraphText: {
        fontSize: 9,
        lineHeight: 1.65,
        textAlign: 'justify',
        letterSpacing: 0.1,
    },
    divider: {
        borderBottom: '0.5pt solid #dddddd',
        marginVertical: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 36,
        right: 36,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '0.5pt solid #cccccc',
        paddingTop: 6,
    },
    footerText: {
        fontSize: 7,
        color: '#999999',
    },
    pageNumber: {
        fontSize: 8,
        color: '#555555',
        fontWeight: 700,
    },
    watermark: {
        position: 'absolute',
        top: '45%',
        left: '25%',
        fontSize: 28,
        color: '#eeeeee',
        fontWeight: 700,
        transform: 'rotate(-30deg)',
        letterSpacing: 4,
    },
});

interface Props {
    passage: DbPassage;
}

function splitParagraphs(text: string): string[] {
    return text.split(/\n\n+/).filter(Boolean);
}

export function KICEDocument({ passage }: Props) {
    const paragraphs = splitParagraphs(passage.content);
    const half = Math.ceil(paragraphs.length / 2);
    const col1 = paragraphs.slice(0, half);
    const col2 = paragraphs.slice(half);

    return (
        <Document title={passage.title} author="KICE-Gen AI">
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerMain}>2026학년도 대학수학능력시험  국어 영역</Text>
                    <Text style={styles.headerSub}>생성형 AI 기반 비문학 지문 (KICE-Gen)</Text>
                </View>

                {/* Exam Info Boxes */}
                <View style={styles.examInfoRow}>
                    <View style={styles.examBox}>
                        <Text style={styles.examBoxLabel}>수험 번호</Text>
                        <View style={styles.examBoxInner} />
                    </View>
                    <View style={styles.examBox}>
                        <Text style={styles.examBoxLabel}>성 명</Text>
                        <View style={styles.examBoxInner} />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.passageTitle}>{passage.title}</Text>
                <Text style={styles.passageKeyword}>[ 주제어: {passage.keyword} | 분야: {passage.category} ]</Text>
                <View style={styles.divider} />

                {/* Two-column passage */}
                <View style={styles.columns}>
                    {/* Column 1 */}
                    <View style={styles.column}>
                        {col1.map((para, i) => (
                            <View key={i} style={styles.paragraph}>
                                <Text style={styles.paragraphNum}>{i + 1}문단</Text>
                                <Text style={styles.paragraphText}>{para}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Column 2 */}
                    <View style={styles.column}>
                        {col2.map((para, i) => (
                            <View key={i} style={styles.paragraph}>
                                <Text style={styles.paragraphNum}>{half + i + 1}문단</Text>
                                <Text style={styles.paragraphText}>{para}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>© 2026 KICE-Gen AI  |  평가원 형식 모의 지문</Text>
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}
