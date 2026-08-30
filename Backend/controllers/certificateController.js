import PDFDocument from "pdfkit";
import QuizResult from "../models/QuizResult.js";

export const generateCertificate = async (req, res) => {
    try {
        const { studentName, courseName, courseId } = req.body;

        if (!studentName || !courseName || !courseId) {
            return res.status(400).json({ message: "Student name, course name, and course ID are required" });
        }

        // Check karo ke student ne is course ka quiz pass kiya hai ya nahi
        const result = await QuizResult.findOne({
            student_id: req.user.id,
            course_id: courseId,
        });

        if (!result || !result.passed) {
            return res.status(403).json({
                status: false,
                message: "You must pass the quiz for this course before getting a certificate",
            });
        }

        const doc = new PDFDocument({ layout: "landscape", size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=certificate-${studentName}.pdf`);

        doc.pipe(res);

        doc.fontSize(30).text("Certificate of Completion", { align: "center" });
        doc.moveDown();
        doc.fontSize(20).text(`This certifies that`, { align: "center" });
        doc.moveDown();
        doc.fontSize(26).text(studentName, { align: "center", underline: true });
        doc.moveDown();
        doc.fontSize(18).text(`has successfully completed the course`, { align: "center" });
        doc.moveDown();
        doc.fontSize(22).text(courseName, { align: "center" });
        doc.moveDown(2);
        doc.fontSize(14).text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });

        doc.end();

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};