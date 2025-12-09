<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InfoPointAssistant;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AssistantController extends Controller
{
    public function __invoke(Request $request, InfoPointAssistant $assistant): Response
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:2000'],
        ]);

        try {
            $result = $assistant->answer($validated['question']);

            return response($result);
        } catch (\Throwable $exception) {
            return response([
                'message' => 'Impossibile ottenere una risposta al momento.',
                'error' => $exception->getMessage(),
            ], 422);
        }
    }
}
