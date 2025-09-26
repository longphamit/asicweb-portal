import { updateAccountStatus } from '../../../../lib/controller/accountController';

export async function POST(request) {
  try {
    console.log('Received POST request to /api/accounts/unlock-account');
    const { accountId, status } = await request.json();

    await updateAccountStatus(accountId,1);
    return new Response(JSON.stringify({ success: true, message: 'Mở Khóa tài khoản thành công' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in POST /api/accounts/unlock-account:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}