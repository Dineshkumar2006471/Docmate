import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (optional, using standard fonts for now)
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
// });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        color: '#00796B', // Teal
        fontWeight: 'bold',
    },
    meta: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'right',
    },
    section: {
        marginBottom: 15,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#111827',
        marginBottom: 10,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#00796B',
        paddingBottom: 5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 100,
        fontSize: 10,
        color: '#4B5563',
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
        fontSize: 10,
        color: '#1F2937',
    },
    vitalCard: {
        backgroundColor: '#F3F4F6',
        padding: 10,
        marginBottom: 10,
        borderRadius: 4,
    },
    vitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    vitalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    vitalValue: {
        fontSize: 12,
        color: '#00796B',
    },
    statusCritical: {
        color: '#DC2626',
        fontWeight: 'bold',
    },
    statusNormal: {
        color: '#059669',
        fontWeight: 'bold',
    },
    analysisText: {
        fontSize: 9,
        color: '#4B5563',
        marginTop: 5,
        fontStyle: 'italic',
    },
    aiBox: {
        borderWidth: 1,
        borderColor: '#00796B',
        padding: 15,
        borderRadius: 4,
        backgroundColor: '#F0FDFA',
    },
    riskLevel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#DC2626',
        marginBottom: 5,
    },
    remedyCard: {
        marginBottom: 10,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#00796B',
        backgroundColor: '#F9FAFB',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
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
        {/* Page 1: Patient Info & Vitals */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>DocMate Medical Report</Text>
                <View>
                    <Text style={styles.meta}>Date: {data.meta.date}</Text>
                    <Text style={styles.meta}>Time: {data.meta.time}</Text>
                    <Text style={styles.meta}>ID: {data.meta.id}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{data.patient.name}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Age/Gender:</Text><Text style={styles.value}>{data.patient.age} / {data.patient.gender}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Blood Type:</Text><Text style={styles.value}>{data.patient.bloodType}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Medical History:</Text><Text style={styles.value}>{data.patient.history}</Text></View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{data.emergency.contactName}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Relation:</Text><Text style={styles.value}>{data.emergency.relation}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Phone:</Text><Text style={styles.value}>{data.emergency.phone}</Text></View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vital Signs Analysis</Text>
                {data.vitals.map((vital, index) => (
                    <View key={index} style={styles.vitalCard}>
                        <View style={styles.vitalHeader}>
                            <Text style={styles.vitalLabel}>{vital.label}</Text>
                            <Text style={styles.vitalValue}>{vital.value} {vital.unit}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Reference:</Text>
                            <Text style={styles.value}>{vital.ref}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Status:</Text>
                            <Text style={vital.status === 'Critical' ? styles.statusCritical : styles.statusNormal}>{vital.status}</Text>
                        </View>
                        <Text style={styles.analysisText}>Analysis: {vital.analysis}</Text>
                    </View>
                ))}
            </View>
            <Text style={styles.footer}>Generated by DocMate AI • Page 1 of 5</Text>
        </Page>

        {/* Page 2: AI Summary */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Health Assessment</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.aiBox}>
                    <Text style={styles.sectionTitle}>Risk Assessment</Text>
                    <Text style={styles.riskLevel}>{data.aiSummary.riskLevel}</Text>
                    <Text style={{ fontSize: 10, marginTop: 10 }}>{data.aiSummary.reasoning}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Clinical Reasoning</Text>
                <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{data.aiSummary.overall}</Text>
            </View>
            <Text style={styles.footer}>Generated by DocMate AI • Page 2 of 5</Text>
        </Page>

        {/* Page 3: Recommendations */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Recommendations</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Immediate Actions</Text>
                <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{data.aiSummary.recommendation}</Text>
            </View>
            <Text style={styles.footer}>Generated by DocMate AI • Page 3 of 5</Text>
        </Page>

        {/* Page 4: Remedies */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Suggested Remedies</Text>
            </View>

            {data.remedies.map((item, index) => (
                <View key={index} style={styles.section}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Condition: {item.condition}</Text>

                    <View style={styles.remedyCard}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#00796B' }}>Home Remedies:</Text>
                        {item.home.map((r, i) => <Text key={i} style={{ fontSize: 10, marginLeft: 10 }}>• {r}</Text>)}
                    </View>

                    <View style={styles.remedyCard}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#00796B' }}>Ayurvedic:</Text>
                        {item.ayurvedic.map((r, i) => <Text key={i} style={{ fontSize: 10, marginLeft: 10 }}>• {r}</Text>)}
                    </View>

                    <View style={styles.remedyCard}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#00796B' }}>Natural/Holistic:</Text>
                        {item.natural.map((r, i) => <Text key={i} style={{ fontSize: 10, marginLeft: 10 }}>• {r}</Text>)}
                    </View>
                </View>
            ))}
            <Text style={styles.footer}>Generated by DocMate AI • Page 4 of 5</Text>
        </Page>

        {/* Page 5: Disclaimer */}
        <Page size="A4" style={styles.page}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Medical Disclaimer</Text>
                <Text style={{ fontSize: 10, textAlign: 'center', lineHeight: 1.5 }}>
                    This report is generated by an AI system (DocMate) and is intended for informational purposes only.
                    It does not constitute professional medical advice, diagnosis, or treatment.
                    Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                    Never disregard professional medical advice or delay in seeking it because of something you have read in this report.
                    If you think you may have a medical emergency, call your doctor or emergency services immediately.
                </Text>
            </View>
            <Text style={styles.footer}>Generated by DocMate AI • Page 5 of 5</Text>
        </Page>
    </Document>
);
