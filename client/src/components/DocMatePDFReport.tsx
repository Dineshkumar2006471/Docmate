import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Path } from '@react-pdf/renderer';

// --- Icons ---
const IconUser = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00796B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
    </Svg>
);

const IconPhone = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00796B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
);

const IconActivity = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00796B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
);

const IconFileText = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00796B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <Path d="M14 2v6h6" />
        <Path d="M16 13H8" />
        <Path d="M16 17H8" />
        <Path d="M10 9H8" />
    </Svg>
);

const IconAlert = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <Path d="M12 9v4" />
        <Path d="M12 17h.01" />
    </Svg>
);

const IconHeart = () => (
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00796B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
);

// --- Styles ---
const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
    },
    title: {
        fontSize: 18,
        color: '#00796B',
        fontWeight: 'bold',
    },
    meta: {
        fontSize: 8,
        color: '#6B7280',
        textAlign: 'right',
    },
    section: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 4,
    },
    sectionTitle: {
        fontSize: 11,
        color: '#111827',
        fontWeight: 'bold',
        marginLeft: 6,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    col2: {
        flexDirection: 'row',
        gap: 10,
    },
    half: {
        flex: 1,
    },
    label: {
        width: 70,
        color: '#4B5563',
        fontWeight: 'bold',
        fontSize: 8,
    },
    value: {
        flex: 1,
        color: '#1F2937',
        fontSize: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    card: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#111827',
    },
    cardValue: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#00796B',
    },
    statusText: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    analysisText: {
        fontSize: 7,
        color: '#6B7280',
        fontStyle: 'italic',
        marginTop: 2,
    },
    aiBox: {
        padding: 8,
        backgroundColor: '#F0FDFA',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#00796B',
        marginBottom: 6,
    },
    riskLevel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#DC2626',
        marginBottom: 2,
    },
    remedyGroup: {
        marginBottom: 6,
    },
    remedyTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#00796B',
        marginBottom: 2,
    },
    bullet: {
        fontSize: 8,
        marginLeft: 8,
        color: '#374151',
    },
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        right: 20,
        textAlign: 'center',
        fontSize: 7,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 5,
    },
});

export interface DocMatePDFReportProps {
    data: {
        meta: { date: string; time: string; id: string };
        patient: { name: string; age: number; gender: string; bloodType: string; history: string };
        emergency: { contactName: string; relation: string; phone: string };
        vitals: Array<{ label: string; value: string; unit: string; ref: string; status: string; analysis: string }>;
        aiSummary: { riskLevel: string; reasoning: string; overall: string; recommendation: string };
        remedies: Array<{ condition: string; home: string[]; ayurvedic: string[]; natural: string[] }>;
    };
}

export const DocMatePDFReport: React.FC<DocMatePDFReportProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page} wrap>
            {/* Header */}
            <View style={styles.header} fixed>
                <Text style={styles.title}>DocMate Medical Report</Text>
                <View>
                    <Text style={styles.meta}>Date: {data.meta.date}</Text>
                    <Text style={styles.meta}>Time: {data.meta.time}</Text>
                    <Text style={styles.meta}>ID: {data.meta.id}</Text>
                </View>
            </View>

            {/* Patient & Emergency Info (Side by Side) */}
            <View style={styles.col2}>
                <View style={[styles.section, styles.half]}>
                    <View style={styles.sectionHeader}>
                        <IconUser />
                        <Text style={styles.sectionTitle}>Patient Information</Text>
                    </View>
                    <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{data.patient.name}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Age/Gender:</Text><Text style={styles.value}>{data.patient.age} / {data.patient.gender}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Blood Type:</Text><Text style={styles.value}>{data.patient.bloodType}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>History:</Text><Text style={styles.value}>{data.patient.history}</Text></View>
                </View>

                <View style={[styles.section, styles.half]}>
                    <View style={styles.sectionHeader}>
                        <IconPhone />
                        <Text style={styles.sectionTitle}>Emergency Contact</Text>
                    </View>
                    <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{data.emergency.contactName}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Relation:</Text><Text style={styles.value}>{data.emergency.relation}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Phone:</Text><Text style={styles.value}>{data.emergency.phone}</Text></View>
                </View>
            </View>

            {/* Vitals Grid */}
            <View style={styles.section} wrap={false}>
                <View style={styles.sectionHeader}>
                    <IconActivity />
                    <Text style={styles.sectionTitle}>Vital Signs Analysis</Text>
                </View>
                <View style={styles.grid}>
                    {data.vitals.map((vital, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{vital.label}</Text>
                                <Text style={styles.cardValue}>{vital.value} {vital.unit}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={{ fontSize: 7, color: '#6B7280', width: 40 }}>Ref:</Text>
                                <Text style={{ fontSize: 7, color: '#374151' }}>{vital.ref}</Text>
                            </View>
                            <Text style={[styles.statusText, { color: vital.status === 'Critical' ? '#DC2626' : '#059669' }]}>
                                {vital.status}
                            </Text>
                            <Text style={styles.analysisText}>{vital.analysis}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* AI Summary */}
            <View style={styles.section} wrap={false}>
                <View style={styles.sectionHeader}>
                    <IconFileText />
                    <Text style={styles.sectionTitle}>AI Health Assessment</Text>
                </View>

                <View style={styles.aiBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <IconAlert />
                        <Text style={[styles.riskLevel, { marginLeft: 6, marginBottom: 0 }]}>Risk Level: {data.aiSummary.riskLevel}</Text>
                    </View>
                    <Text style={{ fontSize: 8, color: '#374151' }}>{data.aiSummary.reasoning}</Text>
                </View>

                <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 4, marginBottom: 2 }}>Clinical Reasoning:</Text>
                <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#374151' }}>{data.aiSummary.overall}</Text>

                <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 6, marginBottom: 2 }}>Recommendations:</Text>
                <Text style={{ fontSize: 8, lineHeight: 1.4, color: '#374151' }}>{data.aiSummary.recommendation}</Text>
            </View>

            {/* Remedies */}
            {data.remedies.length > 0 && (
                <View style={styles.section} wrap={false}>
                    <View style={styles.sectionHeader}>
                        <IconHeart />
                        <Text style={styles.sectionTitle}>Suggested Remedies</Text>
                    </View>
                    {data.remedies.map((item, index) => (
                        <View key={index}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>Condition: {item.condition}</Text>
                            <View style={styles.col2}>
                                <View style={[styles.remedyGroup, styles.half]}>
                                    <Text style={styles.remedyTitle}>Home Remedies</Text>
                                    {item.home.map((r, i) => <Text key={i} style={styles.bullet}>• {r}</Text>)}
                                </View>
                                <View style={[styles.remedyGroup, styles.half]}>
                                    <Text style={styles.remedyTitle}>Ayurvedic</Text>
                                    {item.ayurvedic.map((r, i) => <Text key={i} style={styles.bullet}>• {r}</Text>)}
                                </View>
                            </View>
                            <View style={styles.remedyGroup}>
                                <Text style={styles.remedyTitle}>Natural / Holistic</Text>
                                {item.natural.map((r, i) => <Text key={i} style={styles.bullet}>• {r}</Text>)}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Disclaimer */}
            <View style={{ marginTop: 10, padding: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' }} wrap={false}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>Medical Disclaimer</Text>
                <Text style={{ fontSize: 6, textAlign: 'center', color: '#9CA3AF', lineHeight: 1.3 }}>
                    This report is generated by DocMate AI for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
                    Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </Text>
            </View>

            <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                `Generated by DocMate AI • Page ${pageNumber} of ${totalPages}`
            )} fixed />
        </Page>
    </Document>
);
