import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { checkRLSStatus, testRLSPolicies } from "@/lib/test-rls";
import { setupMockAuthentication, getCurrentMockUser } from "@/lib/auth-mock";
import {
  diagnoseRLSIssues,
  repairRLSIssues,
  displayDiagnostics,
} from "@/lib/rls-diagnostics";

interface RLSStatusProps {
  showDetails?: boolean;
}

export function RLSStatus({ showDetails = false }: RLSStatusProps) {
  const [status, setStatus] = useState({
    authenticated: false,
    canRead: false,
    canWrite: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const newStatus = await checkRLSStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error("Error checking RLS status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    try {
      const result = await testRLSPolicies();
      setTestResult(result);
      await checkStatus();
    } catch (error) {
      console.error("Error running RLS test:", error);
      setTestResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const results = await diagnoseRLSIssues();
      displayDiagnostics(results);
      await checkStatus();
    } catch (error) {
      console.error("Error running diagnostics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const repairIssues = async () => {
    setIsLoading(true);
    try {
      const success = await repairRLSIssues();
      if (success) {
        setTestResult(true);
        await checkStatus();
      } else {
        setTestResult(false);
      }
    } catch (error) {
      console.error("Error repairing RLS issues:", error);
      setTestResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setupAuth = async () => {
    setIsLoading(true);
    try {
      const success = await setupMockAuthentication();
      if (success) {
        await checkStatus();
      }
    } catch (error) {
      console.error("Error setting up authentication:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = () => {
    const allGood = status.authenticated && status.canRead && status.canWrite;
    return (
      <Badge variant={allGood ? "default" : "destructive"}>
        <Shield className="w-3 h-3 mr-1" />
        RLS {allGood ? "OK" : "Issues"}
      </Badge>
    );
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <Button
          variant="ghost"
          size="sm"
          onClick={checkStatus}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
        </Button>
      </div>
    );
  }

  const currentUser = getCurrentMockUser();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5" />
          RLS Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User */}
        {currentUser && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Mock User:</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
        )}

        {/* Status Checks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Authenticated</span>
            {getStatusIcon(status.authenticated)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Can Read</span>
            {getStatusIcon(status.canRead)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Can Write</span>
            {getStatusIcon(status.canWrite)}
          </div>
        </div>

        {/* Test Result */}
        {testResult !== null && (
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResult)}
              <span className="text-sm font-medium">
                Full Test: {testResult ? "Passed" : "Failed"}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Check
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runFullTest}
            disabled={isLoading}
          >
            Test RLS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={isLoading}
          >
            Diagnose
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={repairIssues}
            disabled={isLoading}
          >
            Repair
          </Button>
        </div>

        {!status.authenticated && (
          <Button
            variant="default"
            size="sm"
            onClick={setupAuth}
            disabled={isLoading}
            className="w-full"
          >
            Setup Auth
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
