import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { acceptInvite } from '../API/apiService';
import { message, Button, Spin, Input } from 'antd';

const AcceptInvite = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState(null);
  const [inviteMeta, setInviteMeta] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const role = params.get("role");
    const viewId = params.get("viewId");
    const profile = params.get("profile");
    const isRoot = params.get("isRootElement");
    const email = params.get("email");
    const number = params.get("mobile");
    

    if (!token || !email) {
      message.error('Invalid invite link.');
      navigate('/');
      return;
    }

    setInviteToken(token);
    setInviteMeta({ name, role, viewId, profile, number,email, isRootElement: isRoot === "true" });
    localStorage.setItem("inviteToken", token);
    setLoading(false);
  }, [location.search]);

  const handleAccept = async () => {
    if (!password || !confirmPassword) {
      message.warning("Please enter and confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await acceptInvite(inviteToken, inviteMeta.email, password,inviteMeta.number);
      message.success('Invitation accepted! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error("❌ Error accepting invite:", err);
      message.error(err.message || 'Error accepting invite.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin tip="Loading invite..." />;

  return (
    <div style={{ padding: '2rem', maxWidth: 480, margin: '0 auto' }}>
      <h2>You're invited to join <strong>{inviteMeta.name || 'Shramii'}</strong></h2>
      <p>Role: <strong>{inviteMeta.role}</strong></p>
      <p>Mobile: <strong>{inviteMeta.number}</strong></p>


      <Input.Password
        placeholder="Set your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-3"
      />
      <Input.Password
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="mb-4"
      />

      <Button type="primary" block onClick={handleAccept}>
        Accept Invitation
      </Button>
    </div>
  );
};

export default AcceptInvite;
