import React, { useState, useEffect } from 'react';
import { formsAPI } from '../../services/api';
import Navbar from './Navbar';

function FormBuilder({ user, onLogout }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    fields: [
      { label: 'Name', fieldType: 'text', required: true, order: 1, classificationWeight: 'low' },
      { label: 'Email', fieldType: 'email', required: true, order: 2, classificationWeight: 'low' },
    ],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await formsAPI.getAll();
      setForms(response.data.forms);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await formsAPI.create(newForm);
      setSuccess('Form created successfully!');
      setShowCreateModal(false);
      setNewForm({
        title: '',
        description: '',
        fields: [
          { label: 'Name', fieldType: 'text', required: true, order: 1, classificationWeight: 'low' },
          { label: 'Email', fieldType: 'email', required: true, order: 2, classificationWeight: 'low' },
        ],
      });
      loadForms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create form');
    }
  };

  const handleToggleForm = async (formId) => {
    try {
      await formsAPI.toggle(formId);
      loadForms();
    } catch (error) {
      console.error('Error toggling form:', error);
    }
  };

  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;

    try {
      await formsAPI.delete(formId);
      setSuccess('Form deleted successfully');
      loadForms();
    } catch (error) {
      setError('Failed to delete form');
    }
  };

  const addField = () => {
    const newField = {
      label: '',
      fieldType: 'text',
      required: false,
      order: newForm.fields.length + 1,
      classificationWeight: 'medium',
    };
    setNewForm({ ...newForm, fields: [...newForm.fields, newField] });
  };

  const removeField = (index) => {
    const fields = newForm.fields.filter((_, i) => i !== index);
    setNewForm({ ...newForm, fields });
  };

  const updateField = (index, key, value) => {
    const fields = [...newForm.fields];
    fields[index][key] = value;
    setNewForm({ ...newForm, fields });
  };

  const copyFormLink = (formId) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    setSuccess('Form link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div>
        <Navbar user={user} onLogout={onLogout} currentPage="forms" />
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} currentPage="forms" />
      
      <div className="page">
        <div className="container">
          <div className="page-header flex-between">
            <div>
              <h1 className="page-title">Forms</h1>
              <p className="page-description">Create and manage your lead collection forms</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              + Create New Form
            </button>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {forms.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No forms yet</h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Create your first form to start collecting and classifying leads
              </p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                Create Your First Form
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1">
              {forms.map((form) => (
                <div key={form._id} className="card">
                  <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {form.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {form.description || 'No description'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: form.isActive ? '#d1fae5' : '#f3f4f6',
                          color: form.isActive ? '#065f46' : '#6b7280',
                        }}
                      >
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      <strong>{form.fields?.length || 0}</strong> fields • 
                      <strong> {form.submissionCount || 0}</strong> submissions
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => copyFormLink(form._id)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.875rem' }}
                    >
                      📋 Copy Link
                    </button>
                    <button
                      onClick={() => window.open(`/form/${form._id}`, '_blank')}
                      className="btn btn-outline"
                      style={{ fontSize: '0.875rem' }}
                    >
                      👁️ Preview
                    </button>
                    <button
                      onClick={() => handleToggleForm(form._id)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.875rem' }}
                    >
                      {form.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form._id)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.875rem', marginLeft: 'auto' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header flex-between">
              <h2 className="card-title">Create New Form</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateForm}>
              <div className="form-group">
                <label className="form-label">Form Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  required
                  placeholder="e.g., Lead Qualification Form"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  rows={2}
                  placeholder="Briefly describe this form..."
                />
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Form Fields</label>
                  <button type="button" onClick={addField} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                    + Add Field
                  </button>
                </div>

                {newForm.fields.map((field, index) => (
                  <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Field Label"
                        value={field.label}
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                        required
                      />
                      <select
                        className="form-select"
                        value={field.fieldType}
                        onChange={(e) => updateField(index, 'fieldType', e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="number">Number</option>
                        <option value="textarea">Text Area</option>
                        <option value="select">Dropdown</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(index, 'required', e.target.checked)}
                        />
                        Required
                      </label>
                      {index > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          style={{ color: '#ef4444', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormBuilder;