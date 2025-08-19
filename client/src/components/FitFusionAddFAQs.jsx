import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export function FitFusionAddFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/faqs`);
      setFaqs(res.data);
    } catch {
      toast.error("Failed to fetch FAQs");
    }
  };

  const handleAddFAQ = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Both fields required!");
      return;
    }

    const exists = faqs.some(
      (faq) => faq.question.toLowerCase() === question.toLowerCase()
    );
    if (exists) {
      toast.error("This question already exists!");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/faqs`,
        { question, answer },
        { withCredentials: true }
      );
      toast.success("FAQ added!");
      setQuestion("");
      setAnswer("");
      fetchFaqs();
    } catch {
      toast.error("Failed to add FAQ");
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleSaveEdit = async (faqId) => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast.error("Both fields required!");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/faqs/${faqId}`,
        { question: editQuestion, answer: editAnswer },
        { withCredentials: true }
      );
      toast.success("FAQ updated!");
      setEditingId(null);
      fetchFaqs();
    } catch {
      toast.error("Failed to update FAQ");
    }
  };

  const confirmDelete = (faqId) => {
    setDeleteId(faqId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/faqs/${deleteId}`, {
        withCredentials: true,
      });
      toast.success("FAQ deleted!");
      setShowDeleteModal(false);
      fetchFaqs();
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer />
      <h3 className="mb-3">Manage FAQs</h3>

      {/* Add FAQ Form */}
      <form onSubmit={handleAddFAQ} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Question</label>
          <input
            type="text"
            className="form-control"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter FAQ question"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Answer</label>
          <textarea
            className="form-control"
            rows="3"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter FAQ answer"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add FAQ
        </button>
      </form>

      {/* FAQs List */}
      <h4>FAQs</h4>
      {faqs.length === 0 ? (
        <p>No FAQs yet.</p>
      ) : (
        <ul className="list-group">
          {faqs.map((faq) => (
            <li
              key={faq._id}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div className="flex-grow-1">
                {editingId === faq._id ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                    />
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <strong>Q:</strong> {faq.question}
                    <br />
                    <strong>A:</strong> {faq.answer}
                  </>
                )}
              </div>

              <div className="ms-3 d-flex flex-column gap-2">
                {editingId === faq._id ? (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      disabled={
                        faq.question === editQuestion &&
                        faq.answer === editAnswer
                      }
                      onClick={() => handleSaveEdit(faq._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(faq)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => confirmDelete(faq._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this FAQ?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
