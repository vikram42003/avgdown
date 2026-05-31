from datetime import date
from typing import List
from models import TriggeredAlert

def render_alert_email_html(domain_name: str, alerts: List[TriggeredAlert]) -> str:
    """
    Renders a highly styled, modern, dark-theme HTML email for SMA drop alerts.
    Fits with the AvgDown premium brand style.
    """
    alert_rows = ""
    for alert in alerts:
        # Determine format based on symbol (e.g., crypto/currencies might not use $)
        is_crypto = alert.symbol.endswith("-USD") or "/" in alert.symbol
        currency_symbol = "" if is_crypto else "$"
        
        alert_rows += f"""
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <td style="padding: 16px; font-weight: 700; color: #ffffff; font-size: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                {alert.symbol}
            </td>
            <td style="padding: 16px; color: #f43f5e; font-size: 14px; font-weight: 500; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                Below SMA
            </td>
            <td style="padding: 16px; color: #e2e8f0; font-size: 14px; font-family: monospace; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                {currency_symbol}{alert.triggered_price:,.2f}
            </td>
            <td style="padding: 16px; color: #94a3b8; font-size: 14px; font-family: monospace; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                {currency_symbol}{alert.sma_value:,.2f}
            </td>
            <td style="padding: 16px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                <a href="https://{domain_name}/dashboard" style="color: #8b5cf6; text-decoration: none; font-size: 13px; font-weight: 600;">
                    View Chart &rarr;
                </a>
            </td>
        </tr>
        """

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AvgDown Price Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 10px;">
        <tr>
            <td align="center">
                <!-- Inner Container -->
                <table role="presentation" width="100%" style="max-width: 600px; width: 100%; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(30, 41, 59, 0.7) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); overflow: hidden; padding: 0; border-collapse: collapse;">
                    <!-- Header Banner -->
                    <tr>
                        <td style="background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">AvgDown</h1>
                            <p style="margin: 4px 0 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 500;">Automated Moving Average Alerts</p>
                        </td>
                    </tr>
                    <!-- Main Body -->
                    <tr>
                        <td style="padding: 32px 24px;">
                            <h2 style="margin-top: 0; margin-bottom: 8px; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">Price Alert Triggered</h2>
                            <p style="margin-top: 0; margin-bottom: 24px; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                                The following asset(s) from your watchlist have dropped below their designated Simple Moving Average (SMA) thresholds.
                            </p>

                            <!-- Alerts Table -->
                            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
                                <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                                            <th align="left" style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">Asset</th>
                                            <th align="left" style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">Condition</th>
                                            <th align="left" style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">Price</th>
                                            <th align="left" style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">SMA</th>
                                            <th style="padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alert_rows}
                                    </tbody>
                                </table>
                            </div>

                            <!-- Call to Action -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://{domain_name}/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 9999px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px; text-align: center; background: rgba(15, 23, 42, 0.4); border-top: 1px solid rgba(255, 255, 255, 0.05);">
                            <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                                You are receiving this email because you registered on AvgDown and enabled alerts for these assets.
                            </p>
                            <p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px;">
                                &copy; {date.today().year} AvgDown. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    return html

def render_alert_email_text(alerts: List[TriggeredAlert]) -> str:
    """Plain text fallback for emails"""
    messages = [alert.message for alert in alerts]
    return "\n".join(messages)
