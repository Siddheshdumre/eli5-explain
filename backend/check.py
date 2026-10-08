from supabase import create_client, ClientOptions
try:
    c = create_client('http://localhost', 'xxx', options=ClientOptions(headers={'Authorization': 'Bearer token'}))
    print('SUCCESS')
except Exception as e:
    import traceback
    traceback.print_exc()
