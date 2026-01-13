#!/usr/bin/env pwsh
# Phase 4 Enhancement Validation Script
# Verifies all agent enhancements are correctly integrated

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Phase 4 Enhancement Validation" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0

# Function to check file exists
function Test-FileExists {
    param($Path, $Description)
    if (Test-Path $Path) {
        Write-Host "[OK] $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[FAIL] $Description - File not found: $Path" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

# Function to check file contains pattern
function Test-FileContains {
    param($Path, $Pattern, $Description)
    if (Test-Path $Path) {
        $content = Get-Content $Path -Raw
        if ($content -match $Pattern) {
            Write-Host "[OK] $Description" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[FAIL] $Description - Pattern not found: $Pattern" -ForegroundColor Red
            $script:ErrorCount++
            return $false
        }
    } else {
        Write-Host "[FAIL] $Description - File not found: $Path" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

# 1. Check Agent SKILL.md Files
Write-Host "`n1. Checking Agent SKILL.md Files..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

Test-FileExists ".claude/skills/codebase-organization-agent/SKILL.md" "Codebase Organization Agent SKILL.md"
Test-FileExists ".claude/skills/coding-agent/SKILL.md" "Coding Agent SKILL.md"
Test-FileExists ".claude/skills/research-agent/SKILL.md" "Research Agent SKILL.md"

# 2. Check Codebase Organization Agent Enhancements
Write-Host "`n2. Validating Codebase Organization Agent..." -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow

$orgAgent = ".claude/skills/codebase-organization-agent/SKILL.md"
Test-FileContains $orgAgent "Vertical Slice Migration Assistant" "New Capability: Vertical Slice Migration"
Test-FileContains $orgAgent "Automated Barrel File Generation" "New Capability: Barrel File Generation"
Test-FileContains $orgAgent "Feature Flag Cleanup" "New Capability: Feature Flag Cleanup"
Test-FileContains $orgAgent "Stale Branch Detection" "New Capability: Stale Branch Detection"
Test-FileContains $orgAgent "License Header Enforcement" "New Capability: License Headers"
Test-FileContains $orgAgent "TODO/FIXME Tracking" "New Capability: TODO Tracking"
Test-FileContains $orgAgent "Mode 4: PR Creation" "New Mode: PR Creation"
Test-FileContains $orgAgent "Cognee" "Cognee Integration"

# 3. Check Coding Agent Enhancements
Write-Host "`n3. Validating Coding Agent..." -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

$codingAgent = ".claude/skills/coding-agent/SKILL.md"
Test-FileContains $codingAgent "Pre-Implementation Architecture Review" "New Capability: Architecture Review"
Test-FileContains $codingAgent "Automatic Type Inference and Annotation" "New Capability: Type Inference"
Test-FileContains $codingAgent "Accessibility \(a11y\) Requirement Enforcement" "New Capability: A11y Enforcement"
Test-FileContains $codingAgent "Mobile-First Responsive Implementation" "New Capability: Mobile-First"
Test-FileContains $codingAgent "Component Documentation Generation" "New Capability: Documentation Generation"
Test-FileContains $codingAgent "Pre-Task Hooks" "Pre-Task Hooks Section"
Test-FileContains $codingAgent "Post-Task Hooks" "Post-Task Hooks Section"
Test-FileContains $codingAgent "Load Cognee Context" "Pre-Task Hook: Cognee"
Test-FileContains $codingAgent "Run Airlock Validation" "Post-Task Hook: Airlock"
Test-FileContains $codingAgent "Store New Patterns in Cognee" "Post-Task Hook: Pattern Storage"
Test-FileContains $codingAgent "Generate Conventional Commit Message" "Post-Task Hook: Commit Message"

# 4. Check Research Agent Enhancements
Write-Host "`n4. Validating Research Agent..." -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

$researchAgent = ".claude/skills/research-agent/SKILL.md"
Test-FileContains $researchAgent "Cross-Reference Multiple Documentation Sources" "New Capability: Cross-Reference"
Test-FileContains $researchAgent "Implementation Recommendations with Code Examples" "New Capability: Recommendations"
Test-FileContains $researchAgent "Research History Tracking for Recurring Questions" "New Capability: History Tracking"
Test-FileContains $researchAgent "Automatic Context7 \+ Serena Hybrid Search" "New Capability: Hybrid Search"
Test-FileContains $researchAgent "Output Format Options" "New Capability: Output Formats"
Test-FileContains $researchAgent "Structured Summaries" "Output Format: Summaries"
Test-FileContains $researchAgent "Comparison Tables" "Output Format: Tables"
Test-FileContains $researchAgent "Decision Matrices" "Output Format: Matrices"
Test-FileContains $researchAgent "Cognee" "Cognee Integration"

# 5. Check Tool Allocation Matrix
Write-Host "`n5. Validating Tool Allocation Matrix..." -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Yellow

$toolMatrix = ".claude/tool-allocation-matrix.json"
Test-FileExists $toolMatrix "Tool Allocation Matrix"
Test-FileContains $toolMatrix "`"codebase-organization-agent`"" "Codebase Org Agent Entry"
Test-FileContains $toolMatrix "`"coding-agent`"" "Coding Agent Entry"
Test-FileContains $toolMatrix "`"research-agent`"" "Research Agent Entry"
Test-FileContains $toolMatrix "`"Cognee`"" "Cognee Tool Allocation"

# 6. Check Documentation Files
Write-Host "`n6. Checking Documentation..." -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow

Test-FileExists ".claude/AGENT_ENHANCEMENT_PHASE4_COMPLETE.md" "Phase 4 Completion Document"
Test-FileExists ".claude/ENHANCED_AGENTS_QUICK_REFERENCE.md" "Quick Reference Guide"

# 7. Verify Cognee Integration
Write-Host "`n7. Validating Cognee Integration..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

if (Test-Path $toolMatrix) {
    $matrixContent = Get-Content $toolMatrix -Raw | ConvertFrom-Json

    # Check codebase-organization-agent
    $orgAgentTools = $matrixContent.skill_tool_map."codebase-organization-agent"
    if ($orgAgentTools.allowed_tools -contains "Cognee") {
        Write-Host "[OK] Codebase Org Agent has Cognee access" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Codebase Org Agent missing Cognee in allowed_tools" -ForegroundColor Yellow
        $script:WarningCount++
    }

    if ($orgAgentTools.cognee_permissions.search -eq $true) {
        Write-Host "[OK] Codebase Org Agent has Cognee search permission" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Codebase Org Agent missing Cognee search permission" -ForegroundColor Red
        $script:ErrorCount++
    }

    # Check coding-agent
    $codingAgentTools = $matrixContent.skill_tool_map."coding-agent"
    if ($codingAgentTools.allowed_tools -contains "Cognee") {
        Write-Host "[OK] Coding Agent has Cognee access" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Coding Agent missing Cognee in allowed_tools" -ForegroundColor Yellow
        $script:WarningCount++
    }

    if ($codingAgentTools.cognee_permissions.search -eq $true -and $codingAgentTools.cognee_permissions.add -eq $true) {
        Write-Host "[OK] Coding Agent has full Cognee permissions" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Coding Agent missing full Cognee permissions" -ForegroundColor Red
        $script:ErrorCount++
    }

    # Check research-agent
    $researchAgentTools = $matrixContent.skill_tool_map."research-agent"
    if ($researchAgentTools.allowed_tools -contains "Cognee") {
        Write-Host "[OK] Research Agent has Cognee access" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Research Agent missing Cognee in allowed_tools" -ForegroundColor Yellow
        $script:WarningCount++
    }

    if ($researchAgentTools.cognee_permissions.search -eq $true -and $researchAgentTools.cognee_permissions.add -eq $true) {
        Write-Host "[OK] Research Agent has full Cognee permissions" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Research Agent missing full Cognee permissions" -ForegroundColor Red
        $script:ErrorCount++
    }
}

# 8. Summary
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "`n[SUCCESS] All Phase 4 enhancements validated!" -ForegroundColor Green
    Write-Host "Status: Ready for production use" -ForegroundColor Green
    exit 0
} elseif ($ErrorCount -eq 0) {
    Write-Host "`n[WARNING] Validation completed with $WarningCount warning(s)" -ForegroundColor Yellow
    Write-Host "Status: Functional but review warnings" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n[FAILURE] Validation failed with $ErrorCount error(s) and $WarningCount warning(s)" -ForegroundColor Red
    Write-Host "Status: Fix errors before deployment" -ForegroundColor Red
    exit 1
}
