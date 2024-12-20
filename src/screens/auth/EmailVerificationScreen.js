import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { sendEmailVerification } from 'firebase/auth';
import { styles } from '../../utils/styles';
import BigButton from '../../components/BigButton';
import { useAuth } from '../../context/AuthContext';

export const EmailVerificationScreen = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);

  const handleResendVerification = async () => {
    if (user) {
      try {
        setIsLoadingVerify(true);
        await sendEmailVerification(user);
        Alert.alert('Verification Email Sent', 'Please check your email to verify your account.');
      } catch (error) {
        Alert.alert('Error', 'Failed to send verification email. Please try again.');
      } finally {
        setIsLoadingVerify(false);
      }
    }
  };

  const handleRefresh = async () => {
    if (user) {
      try {
        setIsLoading(true);
        await user.reload();
        if (user.emailVerified) {
            logout();
        } else {
          Alert.alert('Not Verified', 'Your email is not yet verified. Please check your email and verify your account.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to refresh user status. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification Required</Text>
      <Text style={styles.subtitle}>Please verify your email to continue.</Text>
      <Text style={styles.subtitle}>An email has been sent to: {user?.email}</Text>
      <BigButton title="Resend Verification Email" handleSubmit={handleResendVerification} isLoading={isLoadingVerify} />
      <BigButton title="I've Verified My Email" handleSubmit={handleRefresh} isLoading={isLoading} />
      <BigButton title="Logout" handleSubmit={logout} isLoading={false} />
    </View>
  );
};